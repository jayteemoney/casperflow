//! Core data structures for the CasperFlow remittance contract.
//!
//! This module defines the Remittance and Contribution types that represent
//! the core business logic of the platform.

extern crate alloc;

use alloc::string::String;

use casper_types::{account::AccountHash, U512};
use casper_types::bytesrepr::{FromBytes, ToBytes};
use casper_types::CLTyped;

/// Represents a single remittance request with escrow functionality.
///
/// A remittance holds funds in escrow until the target amount is reached,
/// at which point the recipient can release the funds.
#[derive(Clone, Debug)]
pub struct Remittance {
    /// Unique identifier for this remittance
    pub id: u64,

    /// Account that created this remittance
    pub creator: AccountHash,

    /// Account that will receive the funds
    pub recipient: AccountHash,

    /// Target amount to be collected (in motes)
    pub target_amount: U512,

    /// Current amount contributed (in motes)
    pub current_amount: U512,

    /// Description of the remittance purpose
    pub purpose: String,

    /// Timestamp when the remittance was created
    pub created_at: u64,

    /// Whether funds have been released to recipient
    pub is_released: bool,

    /// Whether the remittance has been cancelled
    pub is_cancelled: bool,
}

impl Remittance {
    /// Creates a new remittance instance.
    ///
    /// # Arguments
    ///
    /// * `id` - Unique identifier
    /// * `creator` - Account creating the remittance
    /// * `recipient` - Account to receive funds
    /// * `target_amount` - Target amount in motes
    /// * `purpose` - Description of the remittance
    /// * `created_at` - Creation timestamp
    pub fn new(
        id: u64,
        creator: AccountHash,
        recipient: AccountHash,
        target_amount: U512,
        purpose: String,
        created_at: u64,
    ) -> Self {
        Self {
            id,
            creator,
            recipient,
            target_amount,
            current_amount: U512::zero(),
            purpose,
            created_at,
            is_released: false,
            is_cancelled: false,
        }
    }

    /// Checks if the remittance is active (not released and not cancelled).
    pub fn is_active(&self) -> bool {
        !self.is_released && !self.is_cancelled
    }

    /// Checks if the target amount has been met or exceeded.
    pub fn is_target_met(&self) -> bool {
        self.current_amount >= self.target_amount
    }

    /// Calculates the remaining amount needed to reach the target.
    pub fn remaining_amount(&self) -> U512 {
        if self.current_amount >= self.target_amount {
            U512::zero()
        } else {
            self.target_amount - self.current_amount
        }
    }

    /// Calculates the progress percentage (0-100).
    pub fn progress_percentage(&self) -> u64 {
        if self.target_amount.is_zero() {
            return 100;
        }

        // Calculate percentage: (current * 100) / target
        let current_u64 = self.current_amount.as_u64();
        let target_u64 = self.target_amount.as_u64();

        if target_u64 == 0 {
            return 100;
        }

        let percentage = (current_u64.saturating_mul(100)) / target_u64;
        percentage.min(100)
    }
}

// Manual implementations of serialization traits for Remittance
impl ToBytes for Remittance {
    fn to_bytes(&self) -> Result<alloc::vec::Vec<u8>, casper_types::bytesrepr::Error> {
        let mut result = alloc::vec::Vec::new();
        result.append(&mut self.id.to_bytes()?);
        result.append(&mut self.creator.to_bytes()?);
        result.append(&mut self.recipient.to_bytes()?);
        result.append(&mut self.target_amount.to_bytes()?);
        result.append(&mut self.current_amount.to_bytes()?);
        result.append(&mut self.purpose.to_bytes()?);
        result.append(&mut self.created_at.to_bytes()?);
        result.append(&mut self.is_released.to_bytes()?);
        result.append(&mut self.is_cancelled.to_bytes()?);
        Ok(result)
    }

    fn serialized_length(&self) -> usize {
        self.id.serialized_length()
            + self.creator.serialized_length()
            + self.recipient.serialized_length()
            + self.target_amount.serialized_length()
            + self.current_amount.serialized_length()
            + self.purpose.serialized_length()
            + self.created_at.serialized_length()
            + self.is_released.serialized_length()
            + self.is_cancelled.serialized_length()
    }
}

impl FromBytes for Remittance {
    fn from_bytes(bytes: &[u8]) -> Result<(Self, &[u8]), casper_types::bytesrepr::Error> {
        let (id, remainder) = u64::from_bytes(bytes)?;
        let (creator, remainder) = AccountHash::from_bytes(remainder)?;
        let (recipient, remainder) = AccountHash::from_bytes(remainder)?;
        let (target_amount, remainder) = U512::from_bytes(remainder)?;
        let (current_amount, remainder) = U512::from_bytes(remainder)?;
        let (purpose, remainder) = String::from_bytes(remainder)?;
        let (created_at, remainder) = u64::from_bytes(remainder)?;
        let (is_released, remainder) = bool::from_bytes(remainder)?;
        let (is_cancelled, remainder) = bool::from_bytes(remainder)?;

        Ok((
            Remittance {
                id,
                creator,
                recipient,
                target_amount,
                current_amount,
                purpose,
                created_at,
                is_released,
                is_cancelled,
            },
            remainder,
        ))
    }
}

impl CLTyped for Remittance {
    fn cl_type() -> casper_types::CLType {
        // Represent as a tuple of all fields
        use casper_types::CLType;
        CLType::Any // Using Any for complex custom types
    }
}

/// Represents a single contribution to a remittance.
///
/// Contributions are tracked per-contributor for the refund mechanism.
#[derive(Clone, Debug)]
pub struct Contribution {
    /// Account that made the contribution
    pub contributor: AccountHash,

    /// Amount contributed (in motes)
    pub amount: U512,

    /// Timestamp of the contribution
    pub timestamp: u64,
}

impl Contribution {
    /// Creates a new contribution instance.
    pub fn new(contributor: AccountHash, amount: U512, timestamp: u64) -> Self {
        Self {
            contributor,
            amount,
            timestamp,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use casper_types::account::AccountHash;

    fn mock_account_hash() -> AccountHash {
        AccountHash::new([1u8; 32])
    }

    #[test]
    fn test_remittance_creation() {
        let creator = mock_account_hash();
        let recipient = AccountHash::new([2u8; 32]);
        let target = U512::from(1000);

        let remittance = Remittance::new(
            1,
            creator,
            recipient,
            target,
            "Test remittance".to_string(),
            1234567890,
        );

        assert_eq!(remittance.id, 1);
        assert_eq!(remittance.creator, creator);
        assert_eq!(remittance.recipient, recipient);
        assert_eq!(remittance.target_amount, target);
        assert_eq!(remittance.current_amount, U512::zero());
        assert!(remittance.is_active());
        assert!(!remittance.is_target_met());
    }

    #[test]
    fn test_progress_calculation() {
        let remittance = Remittance {
            id: 1,
            creator: mock_account_hash(),
            recipient: mock_account_hash(),
            target_amount: U512::from(1000),
            current_amount: U512::from(500),
            purpose: "Test".to_string(),
            created_at: 0,
            is_released: false,
            is_cancelled: false,
        };

        assert_eq!(remittance.progress_percentage(), 50);
        assert_eq!(remittance.remaining_amount(), U512::from(500));
    }

    #[test]
    fn test_target_met() {
        let mut remittance = Remittance::new(
            1,
            mock_account_hash(),
            mock_account_hash(),
            U512::from(1000),
            "Test".to_string(),
            0,
        );

        assert!(!remittance.is_target_met());

        remittance.current_amount = U512::from(1000);
        assert!(remittance.is_target_met());

        remittance.current_amount = U512::from(1500);
        assert!(remittance.is_target_met());
    }
}
