//! Storage management for the CasperFlow remittance contract.
//!
//! This module handles all contract storage operations using Casper's
//! dictionary-based storage pattern for gas efficiency.

extern crate alloc;

use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec::Vec;

use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{account::AccountHash, URef, U512};

use crate::{errors::Error, remittance::Remittance};

// Storage key constants
pub const REMITTANCE_COUNTER: &str = "remittance_counter";
pub const REMITTANCES_DICT: &str = "remittances";
pub const CONTRIBUTIONS_DICT: &str = "contributions";
pub const CONTRIBUTORS_DICT: &str = "contributors";
pub const REFUND_CLAIMED_DICT: &str = "refund_claimed";
pub const USER_REMITTANCES_DICT: &str = "user_remittances";
pub const RECIPIENT_REMITTANCES_DICT: &str = "recipient_remittances";
pub const PLATFORM_FEE_BPS: &str = "platform_fee_bps";
pub const FEE_COLLECTOR: &str = "fee_collector";
pub const CONTRACT_OWNER: &str = "contract_owner";
pub const IS_PAUSED: &str = "is_paused";
pub const CONTRACT_PURSE: &str = "contract_purse";

/// Initializes the contract storage with default values.
///
/// This function must be called once during contract installation.
pub fn initialize_contract() {
    // Create contract purse for holding escrowed funds
    let purse = system::create_purse();
    runtime::put_key(CONTRACT_PURSE, purse.into());

    // Initialize counter
    storage::new_dictionary(REMITTANCE_COUNTER)
        .unwrap_or_revert_with(Error::StorageError);

    // Initialize dictionaries
    storage::new_dictionary(REMITTANCES_DICT)
        .unwrap_or_revert_with(Error::StorageError);
    storage::new_dictionary(CONTRIBUTIONS_DICT)
        .unwrap_or_revert_with(Error::StorageError);
    storage::new_dictionary(CONTRIBUTORS_DICT)
        .unwrap_or_revert_with(Error::StorageError);
    storage::new_dictionary(REFUND_CLAIMED_DICT)
        .unwrap_or_revert_with(Error::StorageError);
    storage::new_dictionary(USER_REMITTANCES_DICT)
        .unwrap_or_revert_with(Error::StorageError);
    storage::new_dictionary(RECIPIENT_REMITTANCES_DICT)
        .unwrap_or_revert_with(Error::StorageError);

    // Set default platform fee (50 bps = 0.5%)
    runtime::put_key(PLATFORM_FEE_BPS, storage::new_uref(50u64).into());

    // Set contract owner
    let caller = runtime::get_caller();
    runtime::put_key(CONTRACT_OWNER, storage::new_uref(caller).into());

    // Set fee collector (initially the owner)
    runtime::put_key(FEE_COLLECTOR, storage::new_uref(caller).into());

    // Contract starts unpaused
    runtime::put_key(IS_PAUSED, storage::new_uref(false).into());
}

/// Gets the next remittance ID and increments the counter.
pub fn get_next_remittance_id() -> u64 {
    let counter_uref: URef = runtime::get_key(REMITTANCE_COUNTER)
        .unwrap_or_revert_with(Error::StorageError)
        .into_uref()
        .unwrap_or_revert_with(Error::StorageError);

    let current_counter: u64 = storage::read(counter_uref)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or(0u64);

    let next_id = current_counter
        .checked_add(1)
        .unwrap_or_revert_with(Error::ArithmeticOverflow);

    storage::write(counter_uref, next_id);
    next_id
}

/// Stores a remittance in the dictionary.
pub fn store_remittance(remittance: &Remittance) {
    let dict_uref = get_dict_uref(REMITTANCES_DICT);
    let key = remittance.id.to_string();

    storage::dictionary_put(dict_uref, &key, remittance);
}

/// Retrieves a remittance from storage.
pub fn get_remittance(id: u64) -> Result<Remittance, Error> {
    let dict_uref = get_dict_uref(REMITTANCES_DICT);
    let key = id.to_string();

    storage::dictionary_get(dict_uref, &key)
        .unwrap_or_revert_with(Error::StorageError)
        .ok_or(Error::RemittanceNotFound)
}

/// Stores a contribution amount for a specific remittance and contributor.
pub fn store_contribution(remittance_id: u64, contributor: AccountHash, amount: U512) {
    let dict_uref = get_dict_uref(CONTRIBUTIONS_DICT);
    let key = format!("{}_{}", remittance_id, contributor);

    // Get existing contribution if any
    let existing: U512 = storage::dictionary_get(dict_uref, &key)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or(U512::zero());

    // Add to existing amount
    let new_amount = existing
        .checked_add(amount)
        .unwrap_or_revert_with(Error::ArithmeticOverflow);

    storage::dictionary_put(dict_uref, &key, new_amount);
}

/// Retrieves the contribution amount for a specific remittance and contributor.
pub fn get_contribution(remittance_id: u64, contributor: AccountHash) -> U512 {
    let dict_uref = get_dict_uref(CONTRIBUTIONS_DICT);
    let key = format!("{}_{}", remittance_id, contributor);

    storage::dictionary_get(dict_uref, &key)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or(U512::zero())
}

/// Adds a contributor to the list of contributors for a remittance.
pub fn add_contributor(remittance_id: u64, contributor: AccountHash) {
    let dict_uref = get_dict_uref(CONTRIBUTORS_DICT);
    let key = remittance_id.to_string();

    // Get existing contributors
    let mut contributors: Vec<AccountHash> = storage::dictionary_get(dict_uref, &key)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or_else(Vec::new);

    // Add if not already present
    if !contributors.contains(&contributor) {
        contributors.push(contributor);
        storage::dictionary_put(dict_uref, &key, contributors);
    }
}

/// Marks a refund as claimed for a specific remittance and contributor.
pub fn mark_refund_claimed(remittance_id: u64, contributor: AccountHash) {
    let dict_uref = get_dict_uref(REFUND_CLAIMED_DICT);
    let key = format!("{}_{}", remittance_id, contributor);

    storage::dictionary_put(dict_uref, &key, true);
}

/// Checks if a refund has been claimed.
pub fn is_refund_claimed(remittance_id: u64, contributor: AccountHash) -> bool {
    let dict_uref = get_dict_uref(REFUND_CLAIMED_DICT);
    let key = format!("{}_{}", remittance_id, contributor);

    storage::dictionary_get(dict_uref, &key)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or(false)
}

/// Adds a remittance ID to a user's list of created remittances.
pub fn add_user_remittance(user: AccountHash, remittance_id: u64) {
    let dict_uref = get_dict_uref(USER_REMITTANCES_DICT);
    let key = user.to_string();

    let mut remittances: Vec<u64> = storage::dictionary_get(dict_uref, &key)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or_else(Vec::new);

    remittances.push(remittance_id);
    storage::dictionary_put(dict_uref, &key, remittances);
}

/// Adds a remittance ID to a recipient's list.
pub fn add_recipient_remittance(recipient: AccountHash, remittance_id: u64) {
    let dict_uref = get_dict_uref(RECIPIENT_REMITTANCES_DICT);
    let key = recipient.to_string();

    let mut remittances: Vec<u64> = storage::dictionary_get(dict_uref, &key)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or_else(Vec::new);

    remittances.push(remittance_id);
    storage::dictionary_put(dict_uref, &key, remittances);
}

/// Gets the platform fee in basis points.
pub fn get_platform_fee_bps() -> u64 {
    let uref: URef = runtime::get_key(PLATFORM_FEE_BPS)
        .unwrap_or_revert_with(Error::StorageError)
        .into_uref()
        .unwrap_or_revert_with(Error::StorageError);

    storage::read(uref)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or(50u64)
}

/// Sets the platform fee in basis points.
pub fn set_platform_fee_bps(fee_bps: u64) {
    let uref: URef = runtime::get_key(PLATFORM_FEE_BPS)
        .unwrap_or_revert_with(Error::StorageError)
        .into_uref()
        .unwrap_or_revert_with(Error::StorageError);

    storage::write(uref, fee_bps);
}

/// Gets the fee collector account.
pub fn get_fee_collector() -> AccountHash {
    let uref: URef = runtime::get_key(FEE_COLLECTOR)
        .unwrap_or_revert_with(Error::StorageError)
        .into_uref()
        .unwrap_or_revert_with(Error::StorageError);

    storage::read(uref)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or_revert_with(Error::StorageError)
}

/// Gets the contract owner account.
pub fn get_contract_owner() -> AccountHash {
    let uref: URef = runtime::get_key(CONTRACT_OWNER)
        .unwrap_or_revert_with(Error::StorageError)
        .into_uref()
        .unwrap_or_revert_with(Error::StorageError);

    storage::read(uref)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or_revert_with(Error::StorageError)
}

/// Checks if the contract is paused.
pub fn is_contract_paused() -> bool {
    let uref: URef = runtime::get_key(IS_PAUSED)
        .unwrap_or_revert_with(Error::StorageError)
        .into_uref()
        .unwrap_or_revert_with(Error::StorageError);

    storage::read(uref)
        .unwrap_or_revert_with(Error::StorageError)
        .unwrap_or(false)
}

/// Sets the contract paused state.
pub fn set_contract_paused(paused: bool) {
    let uref: URef = runtime::get_key(IS_PAUSED)
        .unwrap_or_revert_with(Error::StorageError)
        .into_uref()
        .unwrap_or_revert_with(Error::StorageError);

    storage::write(uref, paused);
}

/// Gets the contract's purse URef.
pub fn get_contract_purse() -> URef {
    runtime::get_key(CONTRACT_PURSE)
        .unwrap_or_revert_with(Error::StorageError)
        .into_uref()
        .unwrap_or_revert_with(Error::StorageError)
}

/// Helper function to get dictionary URef by name.
fn get_dict_uref(dict_name: &str) -> URef {
    runtime::get_key(dict_name)
        .unwrap_or_revert_with(Error::StorageError)
        .into_uref()
        .unwrap_or_revert_with(Error::StorageError)
}

// Module for system calls (to avoid direct dependencies)
mod system {
    use casper_contract::contract_api::system as casper_system;
    use casper_types::URef;

    pub fn create_purse() -> URef {
        casper_system::create_purse()
    }
}
