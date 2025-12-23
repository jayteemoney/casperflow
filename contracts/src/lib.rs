//! # CasperFlow - Enterprise-Grade Remittance Platform
//!
//! A production-ready peer-to-peer remittance platform on Casper Network.
//!
//! ## Features
//!
//! - **Group Contributions**: Multiple users pool funds for remittances
//! - **Secure Escrow**: Funds held on-chain until target is met
//! - **Ultra-Low Fees**: 0.5% platform fee (customizable)
//! - **Gas Optimized**: Pull-over-push refund pattern for unlimited contributors
//!
//! ## Architecture
//!
//! The contract uses Casper's dictionary-based storage for gas efficiency
//! and implements the CEP-88 event standard for real-time updates.
//!
//! ## Entry Points
//!
//! ### User Functions
//! - `create_remittance`: Create a new remittance request
//! - `contribute`: Contribute funds to a remittance
//! - `release_funds`: Release funds to recipient (recipient only)
//! - `cancel_remittance`: Cancel and enable refunds (creator only)
//! - `claim_refund`: Claim refund from cancelled remittance
//!
//! ### View Functions
//! - `get_remittance`: Get remittance details
//! - `get_contribution`: Get contribution amount
//! - `is_refund_claimed`: Check if refund was claimed
//! - `get_platform_fee`: Get current platform fee
//!
//! ### Admin Functions (Owner Only)
//! - `set_platform_fee`: Update platform fee
//! - `pause_contract`: Pause all operations
//! - `unpause_contract`: Resume operations

#![no_std]
#![no_main]

extern crate alloc;

use alloc::string::{String, ToString};
use alloc::vec;

mod entry_points;
mod errors;
mod events;
mod remittance;
mod storage;
mod utils;

use casper_contract::contract_api::{runtime, storage as contract_storage};
use casper_types::{
    contracts::NamedKeys, CLType, EntryPoint, EntryPointAccess,
    EntryPointType, EntryPoints, Parameter,
};

/// Contract entry point: create_remittance
#[no_mangle]
pub extern "C" fn create_remittance() {
    entry_points::create_remittance_entry();
}

/// Contract entry point: contribute
#[no_mangle]
pub extern "C" fn contribute() {
    entry_points::contribute_entry();
}

/// Contract entry point: release_funds
#[no_mangle]
pub extern "C" fn release_funds() {
    entry_points::release_funds_entry();
}

/// Contract entry point: cancel_remittance
#[no_mangle]
pub extern "C" fn cancel_remittance() {
    entry_points::cancel_remittance_entry();
}

/// Contract entry point: claim_refund
#[no_mangle]
pub extern "C" fn claim_refund() {
    entry_points::claim_refund_entry();
}

/// Contract entry point: get_remittance
#[no_mangle]
pub extern "C" fn get_remittance() {
    entry_points::get_remittance_entry();
}

/// Contract entry point: get_contribution
#[no_mangle]
pub extern "C" fn get_contribution() {
    entry_points::get_contribution_entry();
}

/// Contract entry point: is_refund_claimed
#[no_mangle]
pub extern "C" fn is_refund_claimed() {
    entry_points::is_refund_claimed_entry();
}

/// Contract entry point: get_platform_fee
#[no_mangle]
pub extern "C" fn get_platform_fee() {
    entry_points::get_platform_fee_entry();
}

/// Contract entry point: set_platform_fee (admin only)
#[no_mangle]
pub extern "C" fn set_platform_fee() {
    entry_points::set_platform_fee_entry();
}

/// Contract entry point: pause_contract (admin only)
#[no_mangle]
pub extern "C" fn pause_contract() {
    entry_points::pause_contract_entry();
}

/// Contract entry point: unpause_contract (admin only)
#[no_mangle]
pub extern "C" fn unpause_contract() {
    entry_points::unpause_contract_entry();
}

/// Contract installation entry point.
///
/// This function is called when the contract is first deployed.
/// It initializes storage and sets up the contract.
#[no_mangle]
pub extern "C" fn call() {
    // Initialize contract storage
    storage::initialize_contract();

    // Define entry points
    let mut entry_points = EntryPoints::new();

    // User entry points
    entry_points.add_entry_point(EntryPoint::new(
        "create_remittance",
        vec![
            Parameter::new("recipient", CLType::Key),
            Parameter::new("target_amount", CLType::U512),
            Parameter::new("purpose", CLType::String),
        ],
        CLType::U64,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "contribute",
        vec![
            Parameter::new("remittance_id", CLType::U64),
            Parameter::new("amount", CLType::U512),
            Parameter::new("purse", CLType::URef),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "release_funds",
        vec![Parameter::new("remittance_id", CLType::U64)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "cancel_remittance",
        vec![Parameter::new("remittance_id", CLType::U64)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "claim_refund",
        vec![Parameter::new("remittance_id", CLType::U64)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // View entry points
    entry_points.add_entry_point(EntryPoint::new(
        "get_remittance",
        vec![Parameter::new("remittance_id", CLType::U64)],
        CLType::Any, // Returns Remittance struct
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "get_contribution",
        vec![
            Parameter::new("remittance_id", CLType::U64),
            Parameter::new("contributor", CLType::Key),
        ],
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "is_refund_claimed",
        vec![
            Parameter::new("remittance_id", CLType::U64),
            Parameter::new("contributor", CLType::Key),
        ],
        CLType::Bool,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "get_platform_fee",
        vec![],
        CLType::U64,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Admin entry points
    entry_points.add_entry_point(EntryPoint::new(
        "set_platform_fee",
        vec![Parameter::new("fee_bps", CLType::U64)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "pause_contract",
        vec![],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    entry_points.add_entry_point(EntryPoint::new(
        "unpause_contract",
        vec![],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Contract,
    ));

    // Create named keys for contract access
    let named_keys = NamedKeys::new();

    // Store contract
    let (contract_hash, _contract_version) = contract_storage::new_contract(
        entry_points,
        Some(named_keys),
        Some("casperflow_contract_package".to_string()),
        Some("casperflow_access_token".to_string()),
    );

    // Store contract hash for easy access
    runtime::put_key("casperflow_contract_hash", contract_hash.into());
}
