//! Event emission for the CasperFlow remittance contract.
//!
//! This module handles event logging using Casper's CEP-88 event standard
//! for efficient on-chain event tracking.

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
    pub fn emit(&self) {
        match self {
            ContractEvent::RemittanceCreated {
                remittance_id,
                creator,
                recipient,
                target_amount,
                purpose,
                timestamp,
            } => {
                runtime::emit_event(
                    "RemittanceCreated",
                    vec![
                        ("remittance_id", remittance_id.to_string()),
                        ("creator", creator.to_string()),
                        ("recipient", recipient.to_string()),
                        ("target_amount", target_amount.to_string()),
                        ("purpose", purpose.clone()),
                        ("timestamp", timestamp.to_string()),
                    ],
                );
            }

            ContractEvent::ContributionMade {
                remittance_id,
                contributor,
                amount,
                new_total,
                timestamp,
            } => {
                runtime::emit_event(
                    "ContributionMade",
                    vec![
                        ("remittance_id", remittance_id.to_string()),
                        ("contributor", contributor.to_string()),
                        ("amount", amount.to_string()),
                        ("new_total", new_total.to_string()),
                        ("timestamp", timestamp.to_string()),
                    ],
                );
            }

            ContractEvent::FundsReleased {
                remittance_id,
                recipient,
                amount,
                platform_fee,
                timestamp,
            } => {
                runtime::emit_event(
                    "FundsReleased",
                    vec![
                        ("remittance_id", remittance_id.to_string()),
                        ("recipient", recipient.to_string()),
                        ("amount", amount.to_string()),
                        ("platform_fee", platform_fee.to_string()),
                        ("timestamp", timestamp.to_string()),
                    ],
                );
            }

            ContractEvent::RemittanceCancelled {
                remittance_id,
                creator,
                total_amount,
                timestamp,
            } => {
                runtime::emit_event(
                    "RemittanceCancelled",
                    vec![
                        ("remittance_id", remittance_id.to_string()),
                        ("creator", creator.to_string()),
                        ("total_amount", total_amount.to_string()),
                        ("timestamp", timestamp.to_string()),
                    ],
                );
            }

            ContractEvent::RefundClaimed {
                remittance_id,
                contributor,
                amount,
                timestamp,
            } => {
                runtime::emit_event(
                    "RefundClaimed",
                    vec![
                        ("remittance_id", remittance_id.to_string()),
                        ("contributor", contributor.to_string()),
                        ("amount", amount.to_string()),
                        ("timestamp", timestamp.to_string()),
                    ],
                );
            }

            ContractEvent::PlatformFeeUpdated {
                old_fee_bps,
                new_fee_bps,
                timestamp,
            } => {
                runtime::emit_event(
                    "PlatformFeeUpdated",
                    vec![
                        ("old_fee_bps", old_fee_bps.to_string()),
                        ("new_fee_bps", new_fee_bps.to_string()),
                        ("timestamp", timestamp.to_string()),
                    ],
                );
            }

            ContractEvent::ContractPaused { timestamp } => {
                runtime::emit_event(
                    "ContractPaused",
                    vec![("timestamp", timestamp.to_string())],
                );
            }

            ContractEvent::ContractUnpaused { timestamp } => {
                runtime::emit_event(
                    "ContractUnpaused",
                    vec![("timestamp", timestamp.to_string())],
                );
            }
        }
    }
}

/// Helper function to get current block timestamp
pub fn get_current_timestamp() -> u64 {
    runtime::get_blocktime().into()
}
