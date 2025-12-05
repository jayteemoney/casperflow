//! Error types and codes for the CasperFlow remittance contract.
//!
//! This module defines all possible error conditions that can occur
//! during contract execution.

use casper_types::ApiError;

/// Custom error codes for the remittance contract.
/// Each error represents a specific failure condition.
#[repr(u16)]
#[derive(Clone, Copy)]
pub enum Error {
    /// Remittance with the given ID does not exist (1)
    RemittanceNotFound = 1,

    /// Caller is not authorized to perform this action (2)
    Unauthorized = 2,

    /// Target amount must be greater than zero (3)
    InvalidTargetAmount = 3,

    /// Contribution amount must be greater than zero (4)
    InvalidContributionAmount = 5,

    /// Remittance has already been released (6)
    AlreadyReleased = 6,

    /// Remittance has been cancelled (7)
    RemittanceCancelled = 7,

    /// Target amount not yet met, cannot release funds (8)
    TargetNotMet = 8,

    /// Purpose string exceeds maximum length (9)
    PurposeMaxLength = 9,

    /// Invalid recipient address (10)
    InvalidRecipient = 10,

    /// Refund has already been claimed (11)
    RefundAlreadyClaimed = 11,

    /// No contribution found for this address (12)
    NoContribution = 12,

    /// Remittance is not cancelled, cannot claim refund (13)
    NotCancelled = 13,

    /// Contract is paused, operations are disabled (14)
    ContractPaused = 14,

    /// Platform fee exceeds maximum allowed (15)
    FeeTooHigh = 15,

    /// Failed to transfer funds (16)
    TransferFailed = 16,

    /// Arithmetic overflow detected (17)
    ArithmeticOverflow = 17,

    /// Storage operation failed (18)
    StorageError = 18,

    /// Invalid account hash (19)
    InvalidAccountHash = 19,

    /// Missing required argument (20)
    MissingArgument = 20,
}

impl From<Error> for ApiError {
    fn from(error: Error) -> Self {
        ApiError::User(error as u16)
    }
}

/// Maximum length for remittance purpose description
pub const MAX_PURPOSE_LENGTH: usize = 256;

/// Maximum platform fee in basis points (5% = 500 bps)
pub const MAX_FEE_BPS: u64 = 500;

/// Default platform fee in basis points (0.5% = 50 bps)
pub const DEFAULT_FEE_BPS: u64 = 50;
