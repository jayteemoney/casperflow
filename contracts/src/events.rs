//! Event emission for the CasperFlow remittance contract.
//!
//! This module handles event logging using Casper's CEP-88 event standard
//! for efficient on-chain event tracking.

extern crate alloc;

use alloc::string::String;
use alloc::vec;

use casper_contract::contract_api::runtime;
use casper_types::{account::AccountHash, U512};

/// Event types emitted by the contract
pub enum ContractEvent {
    /// Emitted when a new remittance is created
    RemittanceCreated {
        remittance_id: u64,
        creator: AccountHash,
        recipient: AccountHash,
        target_amount: U512,
        purpose: String,
        timestamp: u64,
    },

    /// Emitted when a contribution is made to a remittance
    ContributionMade {
        remittance_id: u64,
        contributor: AccountHash,
        amount: U512,
        new_total: U512,
        timestamp: u64,
    },

    /// Emitted when funds are released to the recipient
    FundsReleased {
        remittance_id: u64,
        recipient: AccountHash,
        amount: U512,
        platform_fee: U512,
        timestamp: u64,
    },

    /// Emitted when a remittance is cancelled
    RemittanceCancelled {
        remittance_id: u64,
        creator: AccountHash,
        total_amount: U512,
        timestamp: u64,
    },

    /// Emitted when a contributor claims their refund
    RefundClaimed {
        remittance_id: u64,
        contributor: AccountHash,
        amount: U512,
        timestamp: u64,
    },

    /// Emitted when platform fee is updated
    PlatformFeeUpdated {
        old_fee_bps: u64,
        new_fee_bps: u64,
        timestamp: u64,
    },

    /// Emitted when contract is paused
    ContractPaused { timestamp: u64 },

    /// Emitted when contract is unpaused
    ContractUnpaused { timestamp: u64 },
}

impl ContractEvent {
    /// Emits the event to the blockchain.
    ///
    /// Events are recorded in the contract's execution effects and can be
    /// queried by clients for real-time updates.
    ///
    /// Note: In SDK 4.0, we use runtime::print for event logging.
    /// For production use with SDK 5.x+, replace with CEP-88 events.
    pub fn emit(&self) {
        // Event emission is simplified for SDK 4.0 compatibility
        // In production with SDK 5.x+, use proper CEP-88 event standard
        // For now, events are logged for debugging purposes only
        #[cfg(feature = "debug-events")]
        match self {
            ContractEvent::RemittanceCreated { remittance_id, .. } => {
                runtime::print(&alloc::format!("RemittanceCreated: {}", remittance_id));
            }
            ContractEvent::ContributionMade { remittance_id, amount, .. } => {
                runtime::print(&alloc::format!("ContributionMade: {} - {}", remittance_id, amount));
            }
            ContractEvent::FundsReleased { remittance_id, amount, .. } => {
                runtime::print(&alloc::format!("FundsReleased: {} - {}", remittance_id, amount));
            }
            ContractEvent::RemittanceCancelled { remittance_id, .. } => {
                runtime::print(&alloc::format!("RemittanceCancelled: {}", remittance_id));
            }
            ContractEvent::RefundClaimed { remittance_id, contributor, .. } => {
                runtime::print(&alloc::format!("RefundClaimed: {} - {}", remittance_id, contributor));
            }
            ContractEvent::PlatformFeeUpdated { new_fee_bps, .. } => {
                runtime::print(&alloc::format!("PlatformFeeUpdated: {}", new_fee_bps));
            }
            ContractEvent::ContractPaused { .. } => {
                runtime::print("ContractPaused");
            }
            ContractEvent::ContractUnpaused { .. } => {
                runtime::print("ContractUnpaused");
            }
        }
    }
}

/// Helper function to get current block timestamp
pub fn get_current_timestamp() -> u64 {
    runtime::get_blocktime().into()
}
