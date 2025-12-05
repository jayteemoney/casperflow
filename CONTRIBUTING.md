# Contributing to CasperFlow

Thank you for considering contributing to CasperFlow! We welcome contributions from the community.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report:**
1. Check existing issues to avoid duplicates
2. Verify the bug on the latest version
3. Collect relevant information (error messages, screenshots)

**How to submit:**
1. Use GitHub Issues
2. Use the bug report template
3. Include steps to reproduce
4. Describe expected vs actual behavior
5. Include environment details (browser, OS, wallet version)

### Suggesting Enhancements

**Before suggesting:**
1. Check if it's already suggested
2. Consider if it fits project scope
3. Think about implementation challenges

**How to suggest:**
1. Use GitHub Issues
2. Use the feature request template
3. Clearly describe the feature
4. Explain the use case
5. Consider alternative solutions

### Contributing Code

We accept pull requests for:
- Bug fixes
- Feature implementations
- Performance improvements
- Documentation updates
- Test coverage improvements

---

## Development Setup

### Prerequisites

```bash
# Rust 1.75+
rustup --version

# Node.js 18+
node --version

# Casper client
casper-client --version
```

### Setup Steps

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/casperflow.git
   cd casperflow
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../scripts && npm install
   ```

3. **Build Contract**
   ```bash
   cd contracts
   make build
   ```

4. **Run Tests**
   ```bash
   make test
   ```

5. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

---

## Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clear, concise code
- Follow coding standards
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and focused

### 3. Test Your Changes

```bash
# Test contract
cd contracts
make test
make clippy

# Test frontend
cd frontend
npm run lint
npm run build
```

### 4. Commit Your Changes

Use conventional commits:

```bash
git commit -m "feat: add user dashboard"
git commit -m "fix: resolve wallet connection issue"
git commit -m "docs: update deployment guide"
```

Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

### 5. Push and Create PR

```bash
git push origin feature/amazing-feature
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference related issues
- Screenshots for UI changes
- Test results
- Breaking changes (if any)

### 6. Code Review

- Address review comments
- Keep discussion professional
- Update PR as needed
- Be patient and respectful

### 7. Merge

Once approved, maintainers will merge your PR.

---

## Coding Standards

### Rust (Smart Contract)

**Style:**
```rust
// Use rustfmt
cargo fmt

// Pass clippy
cargo clippy -- -D warnings
```

**Best Practices:**
- Write comprehensive tests
- Use descriptive variable names
- Document public functions
- Handle errors explicitly
- Avoid unwrap() in production code
- Use checked arithmetic

**Example:**
```rust
/// Creates a new remittance request.
///
/// # Arguments
///
/// * `recipient` - AccountHash of the recipient
/// * `target_amount` - Target amount in motes
/// * `purpose` - Description of the remittance
///
/// # Returns
///
/// Remittance ID
pub fn create_remittance(
    recipient: AccountHash,
    target_amount: U512,
    purpose: String,
) -> Result<u64, Error> {
    // Implementation
}
```

### TypeScript (Frontend)

**Style:**
```bash
# Use ESLint
npm run lint

# Use Prettier (if configured)
npm run format
```

**Best Practices:**
- Use TypeScript strictly
- Define proper types/interfaces
- Use functional components
- Handle errors gracefully
- Write accessible UI
- Keep components focused

**Example:**
```typescript
interface RemittanceProps {
  id: number;
  amount: string;
  onRelease: (id: number) => Promise<void>;
}

export function Remittance({ id, amount, onRelease }: RemittanceProps) {
  // Implementation
}
```

### General Guidelines

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **Comments**: Explain WHY, not WHAT
- **Naming**: Clear and descriptive
- **Functions**: Do one thing well

---

## Testing Guidelines

### Smart Contract Tests

**Required:**
- Unit tests for all public functions
- Edge case testing
- Error handling tests
- Gas cost verification

**Example:**
```rust
#[test]
fn test_create_remittance() {
    let remittance = create_test_remittance();
    assert_eq!(remittance.id, 1);
    assert!(!remittance.is_released);
}

#[test]
#[should_panic(expected = "InvalidAmount")]
fn test_zero_amount_fails() {
    create_remittance_with_amount(U512::zero());
}
```

### Frontend Tests

**Best Practices:**
- Test user interactions
- Test error states
- Test edge cases
- Mock blockchain calls
- Test accessibility

---

## Documentation

### What to Document

1. **Code Comments**
   - Complex logic
   - Non-obvious decisions
   - Public APIs
   - Important warnings

2. **README Updates**
   - New features
   - Breaking changes
   - Installation steps
   - Usage examples

3. **API Documentation**
   - Function parameters
   - Return values
   - Error conditions
   - Usage examples

4. **User Guide**
   - New user-facing features
   - Changed workflows
   - Troubleshooting tips

### Documentation Style

- Clear and concise
- Use examples
- Keep it up-to-date
- Include diagrams for complex flows
- Link to related docs

---

## Review Checklist

Before submitting a PR, ensure:

**Code Quality:**
- [ ] Code follows style guidelines
- [ ] No console.log or debug code
- [ ] No commented-out code
- [ ] Proper error handling
- [ ] No hardcoded values

**Testing:**
- [ ] All tests pass
- [ ] New features have tests
- [ ] Edge cases covered
- [ ] No failing linter warnings

**Documentation:**
- [ ] Code is commented
- [ ] README updated (if needed)
- [ ] User guide updated (if needed)
- [ ] CHANGELOG updated

**Git:**
- [ ] Commits are atomic
- [ ] Commit messages follow convention
- [ ] Branch is up-to-date with main
- [ ] No merge conflicts

**Security:**
- [ ] No private keys or secrets
- [ ] Input validation added
- [ ] Access control verified
- [ ] Dependencies are safe

---

## Getting Help

Stuck? Need guidance?

- **Discord**: Join Casper community
- **GitHub Discussions**: Ask questions
- **Issues**: Tag with `help wanted`
- **Code Review**: Request early feedback

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Appreciated in Discord announcements

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making CasperFlow better! 🎉**
