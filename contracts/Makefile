.PHONY: all build test clean prepare

# Build configuration
CARGO = cargo
TARGET = wasm32-unknown-unknown
BUILD_DIR = target/$(TARGET)/release
WASM_FILE = $(BUILD_DIR)/casperflow_escrow.wasm

all: build

# Install required tools
prepare:
	@echo "Installing required tools..."
	rustup target add $(TARGET)
	$(CARGO) install cargo-casper --version 2.2.0 || true

# Build the contract
build: prepare
	@echo "Building contract..."
	$(CARGO) build --release --target $(TARGET)
	@echo "Contract built: $(WASM_FILE)"
	@ls -lh $(WASM_FILE)

# Run tests
test:
	@echo "Running tests..."
	$(CARGO) test --lib

# Run tests with output
test-verbose:
	@echo "Running tests with output..."
	$(CARGO) test --lib -- --nocapture

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	$(CARGO) clean

# Build and run tests
all-test: build test

# Check code without building
check:
	@echo "Checking code..."
	$(CARGO) check

# Format code
fmt:
	@echo "Formatting code..."
	$(CARGO) fmt

# Run clippy linter
clippy:
	@echo "Running clippy..."
	$(CARGO) clippy -- -D warnings
