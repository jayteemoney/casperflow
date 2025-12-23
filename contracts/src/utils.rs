//! Utility functions for the CasperFlow remittance contract.

use casper_contract::{contract_api::runtime, unwrap_or_revert::UnwrapOrRevert};
use casper_types::{account::AccountHash, runtime_args, system::CallStackElement, RuntimeArgs, U512};

use crate::errors::Error;

/// Validates that an account hash is not the zero address.
pub fn validate_account_hash(account: &AccountHash) -> Result<(), Error> {
    if account.as_bytes().iter().all(|&b| b == 0) {
        return Err(Error::InvalidAccountHash);
    }
    Ok(())
}

/// Validates that a U512 amount is greater than zero.
pub fn validate_non_zero_amount(amount: &U512) -> Result<(), Error> {
    if amount.is_zero() {
        return Err(Error::InvalidContributionAmount);
    }
    Ok(())
}

/// Validates that a string does not exceed the maximum length.
pub fn validate_string_length(s: &str, max_length: usize) -> Result<(), Error> {
    if s.len() > max_length {
        return Err(Error::PurposeMaxLength);
    }
    Ok(())
}

/// Gets the account hash of the current caller.
///
/// This function determines who is calling the contract entry point.
pub fn get_caller() -> AccountHash {
    let call_stack = runtime::get_call_stack();

    // Get the immediate caller (second to last in the call stack)
    // Last element is the current contract, second to last is the caller
    if call_stack.len() < 2 {
        runtime::revert(Error::Unauthorized);
    }

    match call_stack[call_stack.len() - 2] {
        CallStackElement::Session { account_hash } => account_hash,
        CallStackElement::StoredSession { account_hash, .. } => account_hash,
        CallStackElement::StoredContract { contract_hash, .. } => {
            // If called by another contract, use the contract hash as bytes
            // Convert contract_hash to account_hash representation
            match AccountHash::from_formatted_str(&contract_hash.to_formatted_string()) {
                Ok(account_hash) => account_hash,
                Err(_) => runtime::revert(Error::InvalidAccountHash),
            }
        }
    }
}

/// Calculates the platform fee from an amount given the fee in basis points.
///
/// # Arguments
///
/// * `amount` - The total amount
/// * `fee_bps` - Fee in basis points (1 bps = 0.01%)
///
/// # Returns
///
/// The calculated fee amount
///
/// # Example
///
/// ```
/// let amount = U512::from(10000);
/// let fee = calculate_fee(&amount, 50); // 50 bps = 0.5%
/// // fee = 50
/// ```
pub fn calculate_fee(amount: &U512, fee_bps: u64) -> U512 {
    // Fee = (amount * fee_bps) / 10000
    // Using checked operations to prevent overflow

    let fee_bps_u512 = U512::from(fee_bps);
    let basis_points = U512::from(10000);

    amount
        .checked_mul(fee_bps_u512)
        .and_then(|result| result.checked_div(basis_points))
        .unwrap_or_revert_with(Error::ArithmeticOverflow)
}

/// Transfers CSPR tokens from one purse to another.
///
/// # Arguments
///
/// * `from_purse` - Source purse URef
/// * `to_account` - Destination account hash
/// * `amount` - Amount to transfer in motes
pub fn transfer_cspr(
    from_purse: casper_types::URef,
    to_account: AccountHash,
    amount: U512,
) -> Result<(), Error> {
    if amount.is_zero() {
        return Ok(());
    }

    // Use the system transfer function
    casper_contract::contract_api::system::transfer_from_purse_to_account(
        from_purse,
        to_account,
        amount,
        None,
    )
    .map(|_| ()) // Discard TransferredTo and return ()
    .map_err(|_| Error::TransferFailed)
}

/// Transfers CSPR tokens from caller to contract purse.
///
/// This is used when contributors send funds to the contract.
pub fn receive_payment(amount: U512) -> Result<(), Error> {
    validate_non_zero_amount(&amount)?;

    // Get the main purse of the caller
    let caller_purse = runtime::get_named_arg::<casper_types::URef>("purse");

    // Get the contract purse
    let contract_purse = crate::storage::get_contract_purse();

    // Transfer from caller's purse to contract purse
    casper_contract::contract_api::system::transfer_from_purse_to_purse(
        caller_purse,
        contract_purse,
        amount,
        None,
    )
    .map_err(|_| Error::TransferFailed)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_account_hash() {
        let zero_account = AccountHash::new([0u8; 32]);
        assert!(validate_account_hash(&zero_account).is_err());

        let valid_account = AccountHash::new([1u8; 32]);
        assert!(validate_account_hash(&valid_account).is_ok());
    }

    #[test]
    fn test_validate_non_zero_amount() {
        assert!(validate_non_zero_amount(&U512::zero()).is_err());
        assert!(validate_non_zero_amount(&U512::from(1)).is_ok());
        assert!(validate_non_zero_amount(&U512::from(1000)).is_ok());
    }

    #[test]
    fn test_validate_string_length() {
        let short_string = "Hello";
        assert!(validate_string_length(short_string, 10).is_ok());

        let long_string = "a".repeat(300);
        assert!(validate_string_length(&long_string, 256).is_err());
    }

    #[test]
    fn test_calculate_fee() {
        // Test 0.5% fee (50 bps)
        let amount = U512::from(10000);
        let fee = calculate_fee(&amount, 50);
        assert_eq!(fee, U512::from(50));

        // Test 1% fee (100 bps)
        let amount = U512::from(10000);
        let fee = calculate_fee(&amount, 100);
        assert_eq!(fee, U512::from(100));

        // Test 5% fee (500 bps)
        let amount = U512::from(10000);
        let fee = calculate_fee(&amount, 500);
        assert_eq!(fee, U512::from(500));

        // Test large amount
        let amount = U512::from(1_000_000_000u64); // 1 CSPR in motes
        let fee = calculate_fee(&amount, 50);
        assert_eq!(fee, U512::from(5_000_000u64)); // 0.005 CSPR
    }

    #[test]
    fn test_zero_fee() {
        let amount = U512::from(10000);
        let fee = calculate_fee(&amount, 0);
        assert_eq!(fee, U512::zero());
    }
}
