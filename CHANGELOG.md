# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- Core functionality for batch branch deletion
- Interactive branch selection interface
- Keyword and regex filtering capabilities
- Safety features and validation
- Comprehensive test suite
- Beautiful CLI interface with colored output

## [1.0.0] - 2024-01-XX

### Added
- Interactive branch selection with checkbox interface
- Keyword-based branch filtering
- Regular expression-based branch filtering
- Automatic protection of current and main branches
- Preview mode for safe deletion testing
- Force deletion option to skip confirmations
- Branch statistics and detailed reporting
- Colored output and progress indicators
- Comprehensive error handling and validation
- Support for merged branch filtering
- Verbose logging option
- Command-line help and version information

### Features
- **Interactive Mode**: User-friendly interface for selecting branches to delete
- **Filtering Options**: 
  - Keyword filtering with case sensitivity options
  - Regular expression filtering with full regex support
  - Exclusion mode for inverse filtering
  - Merged branch inclusion/exclusion
- **Safety Features**:
  - Current branch protection
  - Main branch protection
  - Confirmation prompts
  - Preview mode
  - Validation of branch names and patterns
- **Output Features**:
  - Colored terminal output
  - Branch status indicators
  - Detailed statistics
  - Success/failure reporting
  - Progress indicators

### Technical
- TypeScript implementation with strict type checking
- Modular architecture with clear separation of concerns
- Comprehensive unit and integration tests
- ESLint configuration for code quality
- Jest testing framework with coverage reporting
- tsup for efficient TypeScript bundling
- Commander.js for CLI argument parsing
- Inquirer.js for interactive prompts
- Chalk for colored output

### Documentation
- Comprehensive README with usage examples
- API documentation for all public methods
- Installation and development instructions
- Contributing guidelines
- License information
