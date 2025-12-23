//! Contract entry points for the CasperFlow remittance contract.
//!
//! This module implements all public functions that can be called
//! to interact with the contract.

extern crate alloc;

use alloc::string::String;

use casper_contract::{
    contract_api::runtime,
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{account::AccountHash, CLValue, U512};

use crate::{
    errors::{Error, MAX_PURPOSE_LENGTH},
    events::{ContractEvent, get_current_timestamp},
    remittance::Remittance,
    storage,
    utils,
};

/// Creates a new remittance request.
///
/// # Arguments (via runtime args)
///
/// * `recipient` - AccountHash of the recipient
/// * `target_amount` - Target amount in motes (U512)
/// * `purpose` - Description string (max 256 chars)
///
/// # Returns
///
/// Remittance ID (u64)
pub fn create_remittance_entry() {
    // Check if contract is paused
    if storage::is_contract_paused() {
        runtime::revert(Error::ContractPaused);
    }

    // Get arguments
    let recipient: AccountHash = runtime::get_named_arg("recipient");
    let target_amount: U512 = runtime::get_named_arg("target_amount");
    let purpose: String = runtime::get_named_arg("purpose");

    // Get caller
    let creator = utils::get_caller();

    // Validate inputs
    utils::validate_account_hash(&recipient).unwrap_or_revert();
    utils::validate_account_hash(&creator).unwrap_or_revert();

    if target_amount.is_zero() {
        runtime::revert(Error::InvalidTargetAmount);
    }

    utils::validate_string_length(&purpose, MAX_PURPOSE_LENGTH).unwrap_or_revert();

    if purpose.trim().is_empty() {
        runtime::revert(Error::PurposeMaxLength);
    }

    // Get next remittance ID
    let remittance_id = storage::get_next_remittance_id();

    // Create remittance
    let timestamp = get_current_timestamp();
    let remittance = Remittance::new(
        remittance_id,
        creator,
        recipient,
        target_amount,
        purpose.clone(),
        timestamp,
    );

    // Store remittance
    storage::store_remittance(&remittance);

    // Add to user's list
    storage::add_user_remittance(creator, remittance_id);

    // Add to recipient's list
    storage::add_recipient_remittance(recipient, remittance_id);

    // Emit event
    ContractEvent::RemittanceCreated {
        remittance_id,
        creator,
        recipient,
        target_amount,
        purpose,
        timestamp,
    }
    .emit();

    // Return remittance ID
    runtime::ret(CLValue::from_t(remittance_id).unwrap_or_revert());
}

/// Contributes funds to an existing remittance.
///
/// # Arguments (via runtime args)
///
/// * `remittance_id` - ID of the remittance (u64)
/// * `amount` - Amount to contribute in motes (U512)
pub fn contribute_entry() {
    // Check if contract is paused
    if storage::is_contract_paused() {
        runtime::revert(Error::ContractPaused);
    }

    // Get arguments
    let remittance_id: u64 = runtime::get_named_arg("remittance_id");
    let amount: U512 = runtime::get_named_arg("amount");

    // Get caller
    let contributor = utils::get_caller();

    // Validate amount
    utils::validate_non_zero_amount(&amount).unwrap_or_revert();

    // Get remittance
    let mut remittance = storage::get_remittance(remittance_id).unwrap_or_revert();

    // Verify remittance is active
    if !remittance.is_active() {
        if remittance.is_released {
            runtime::revert(Error::AlreadyReleased);
        } else if remittance.is_cancelled {
            runtime::revert(Error::RemittanceCancelled);
        }
    }

    // Receive payment from contributor
    utils::receive_payment(amount).unwrap_or_revert();

    // Update remittance current amount
    remittance.current_amount = remittance
        .current_amount
        .checked_add(amount)
        .unwrap_or_revert_with(Error::ArithmeticOverflow);

    // Store updated remittance
    storage::store_remittance(&remittance);

    // Store contribution
    storage::store_contribution(remittance_id, contributor, amount);

    // Add to contributors list
    storage::add_contributor(remittance_id, contributor);

    // Emit event
    let timestamp = get_current_timestamp();
    ContractEvent::ContributionMade {
        remittance_id,
        contributor,
        amount,
        new_total: remittance.current_amount,
        timestamp,
    }
    .emit();
}

/// Releases funds to the recipient once target is met.
///
/// # Arguments (via runtime args)
///
/// * `remittance_id` - ID of the remittance (u64)
///
/// # Access Control
///
/// Only the recipient can call this function.
pub fn release_funds_entry() {
    // Check if contract is paused
    if storage::is_contract_paused() {
        runtime::revert(Error::ContractPaused);
    }

    // Get arguments
    let remittance_id: u64 = runtime::get_named_arg("remittance_id");

    // Get caller
    let caller = utils::get_caller();

    // Get remittance
    let mut remittance = storage::get_remittance(remittance_id).unwrap_or_revert();

    // Verify caller is recipient
    if caller != remittance.recipient {
        runtime::revert(Error::Unauthorized);
    }

    // Verify remittance is not already released
    if remittance.is_released {
        runtime::revert(Error::AlreadyReleased);
    }

    // Verify remittance is not cancelled
    if remittance.is_cancelled {
        runtime::revert(Error::RemittanceCancelled);
    }

    // Verify target is met
    if !remittance.is_target_met() {
        runtime::revert(Error::TargetNotMet);
    }

    // Calculate platform fee
    let fee_bps = storage::get_platform_fee_bps();
    let platform_fee = utils::calculate_fee(&remittance.current_amount, fee_bps);

    // Calculate recipient amount
    let recipient_amount = remittance
        .current_amount
        .checked_sub(platform_fee)
        .unwrap_or_revert_with(Error::ArithmeticOverflow);

    // Mark as released
    remittance.is_released = true;
    storage::store_remittance(&remittance);

    // Get contract purse and fee collector
    let contract_purse = storage::get_contract_purse();
    let fee_collector = storage::get_fee_collector();

    // Transfer fee to fee collector
    if !platform_fee.is_zero() {
        utils::transfer_cspr(contract_purse, fee_collector, platform_fee).unwrap_or_revert();
    }

    // Transfer amount to recipient
    utils::transfer_cspr(contract_purse, remittance.recipient, recipient_amount)
        .unwrap_or_revert();

    // Emit event
    let timestamp = get_current_timestamp();
    ContractEvent::FundsReleased {
        remittance_id,
        recipient: remittance.recipient,
        amount: recipient_amount,
        platform_fee,
        timestamp,
    }
    .emit();
}

/// Cancels a remittance and enables refunds.
///
/// # Arguments (via runtime args)
///
/// * `remittance_id` - ID of the remittance (u64)
///
/// # Access Control
///
/// Only the creator can call this function.
///
/// # Note
///
/// This uses the pull-over-push pattern. Contributors must claim
/// refunds individually via `claim_refund`.
pub fn cancel_remittance_entry() {
    // Check if contract is paused
    if storage::is_contract_paused() {
        runtime::revert(Error::ContractPaused);
    }

    // Get arguments
    let remittance_id: u64 = runtime::get_named_arg("remittance_id");

    // Get caller
    let caller = utils::get_caller();

    // Get remittance
    let mut remittance = storage::get_remittance(remittance_id).unwrap_or_revert();

    // Verify caller is creator
    if caller != remittance.creator {
        runtime::revert(Error::Unauthorized);
    }

    // Verify remittance is not already released
    if remittance.is_released {
        runtime::revert(Error::AlreadyReleased);
    }

    // Verify remittance is not already cancelled
    if remittance.is_cancelled {
        runtime::revert(Error::RemittanceCancelled);
    }

    // Mark as cancelled
    remittance.is_cancelled = true;
    storage::store_remittance(&remittance);

    // Emit event
    let timestamp = get_current_timestamp();
    ContractEvent::RemittanceCancelled {
        remittance_id,
        creator: remittance.creator,
        total_amount: remittance.current_amount,
        timestamp,
    }
    .emit();
}

/// Claims refund for a cancelled remittance.
///
/// # Arguments (via runtime args)
///
/// * `remittance_id` - ID of the remittance (u64)
///
/// # Note
///
/// This implements the pull pattern for gas-efficient refunds.
/// Each contributor must claim their own refund.
pub fn claim_refund_entry() {
    // Check if contract is paused
    if storage::is_contract_paused() {
        runtime::revert(Error::ContractPaused);
    }

    // Get arguments
    let remittance_id: u64 = runtime::get_named_arg("remittance_id");

    // Get caller
    let caller = utils::get_caller();

    // Get remittance
    let remittance = storage::get_remittance(remittance_id).unwrap_or_revert();

    // Verify remittance is cancelled
    if !remittance.is_cancelled {
        runtime::revert(Error::NotCancelled);
    }

    // Get contributor's contribution
    let contribution_amount = storage::get_contribution(remittance_id, caller);

    // Verify contribution exists
    if contribution_amount.is_zero() {
        runtime::revert(Error::NoContribution);
    }

    // Verify refund not already claimed
    if storage::is_refund_claimed(remittance_id, caller) {
        runtime::revert(Error::RefundAlreadyClaimed);
    }

    // Mark refund as claimed
    storage::mark_refund_claimed(remittance_id, caller);

    // Transfer refund from contract purse to contributor
    let contract_purse = storage::get_contract_purse();
    utils::transfer_cspr(contract_purse, caller, contribution_amount).unwrap_or_revert();

    // Emit event
    let timestamp = get_current_timestamp();
    ContractEvent::RefundClaimed {
        remittance_id,
        contributor: caller,
        amount: contribution_amount,
        timestamp,
    }
    .emit();
}

// ============================================================================
// View Functions (Read-Only)
// ============================================================================

/// Gets remittance details by ID.
pub fn get_remittance_entry() {
    let remittance_id: u64 = runtime::get_named_arg("remittance_id");
    let remittance = storage::get_remittance(remittance_id).unwrap_or_revert();
    runtime::ret(CLValue::from_t(remittance).unwrap_or_revert());
}

/// Gets contribution amount for a specific contributor.
pub fn get_contribution_entry() {
    let remittance_id: u64 = runtime::get_named_arg("remittance_id");
    let contributor: AccountHash = runtime::get_named_arg("contributor");

    let amount = storage::get_contribution(remittance_id, contributor);
    runtime::ret(CLValue::from_t(amount).unwrap_or_revert());
}

/// Checks if a refund has been claimed.
pub fn is_refund_claimed_entry() {
    let remittance_id: u64 = runtime::get_named_arg("remittance_id");
    let contributor: AccountHash = runtime::get_named_arg("contributor");

    let claimed = storage::is_refund_claimed(remittance_id, contributor);
    runtime::ret(CLValue::from_t(claimed).unwrap_or_revert());
}

/// Gets the current platform fee in basis points.
pub fn get_platform_fee_entry() {
    let fee_bps = storage::get_platform_fee_bps();
    runtime::ret(CLValue::from_t(fee_bps).unwrap_or_revert());
}

// ============================================================================
// Admin Functions (Owner Only)
// ============================================================================

/// Sets the platform fee (owner only).
pub fn set_platform_fee_entry() {
    let caller = utils::get_caller();
    let owner = storage::get_contract_owner();

    if caller != owner {
        runtime::revert(Error::Unauthorized);
    }

    let new_fee_bps: u64 = runtime::get_named_arg("fee_bps");

    if new_fee_bps > crate::errors::MAX_FEE_BPS {
        runtime::revert(Error::FeeTooHigh);
    }

    let old_fee_bps = storage::get_platform_fee_bps();

    // Update the platform fee
    storage::set_platform_fee_bps(new_fee_bps);

    let timestamp = get_current_timestamp();
    ContractEvent::PlatformFeeUpdated {
        old_fee_bps,
        new_fee_bps,
        timestamp,
    }
    .emit();
}

/// Pauses the contract (owner only).
pub fn pause_contract_entry() {
    let caller = utils::get_caller();
    let owner = storage::get_contract_owner();

    if caller != owner {
        runtime::revert(Error::Unauthorized);
    }

    // Set the contract to paused state
    storage::set_contract_paused(true);

    let timestamp = get_current_timestamp();
    ContractEvent::ContractPaused { timestamp }.emit();
}

/// Unpauses the contract (owner only).
pub fn unpause_contract_entry() {
    let caller = utils::get_caller();
    let owner = storage::get_contract_owner();

    if caller != owner {
        runtime::revert(Error::Unauthorized);
    }

    // Set the contract to unpaused state
    storage::set_contract_paused(false);

    let timestamp = get_current_timestamp();
    ContractEvent::ContractUnpaused { timestamp }.emit();
}
