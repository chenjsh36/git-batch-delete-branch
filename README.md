# Git Batch Delete Branch

A powerful CLI tool for batch deleting Git local branches with interactive selection and advanced filtering options.

## Features

- 🎯 **Interactive Selection**: Choose branches to delete with a user-friendly interface
- 🔍 **Keyword Filtering**: Filter branches by keyword with various matching options
- 📝 **Regex Filtering**: Use regular expressions for advanced branch filtering
- 🛡️ **Safety Features**: Automatic protection of current and main branches
- 👀 **Preview Mode**: Preview deletions before executing them
- 📊 **Statistics**: View detailed branch statistics and deletion results
- 🎨 **Beautiful UI**: Colored output and progress indicators

## Installation

### Global Installation

```bash
npm install -g git-batch-delete-branch
```

### Local Installation

```bash
npm install git-batch-delete-branch
```

## Usage

### Interactive Mode

Run the tool without any options to enter interactive mode:

```bash
git-batch-delete-branch
```

This will show you all available branches and let you select which ones to delete.

### Keyword Filtering

Delete branches containing a specific keyword:

```bash
# Delete branches containing "feature"
git-batch-delete-branch --filter "feature"

# Delete branches containing "test" (case insensitive)
git-batch-delete-branch -f "test"

# Exclude branches containing "main"
git-batch-delete-branch --filter "main" --exclude
```

### Regex Filtering

Use regular expressions for advanced filtering:

```bash
# Delete branches matching pattern
git-batch-delete-branch --regex "feature/.*"

# Delete branches matching case-sensitive pattern
git-batch-delete-branch -r "RELEASE-.*"

# Exclude branches matching pattern
git-batch-delete-branch --regex "hotfix/.*" --exclude
```

### Preview Mode

Preview what would be deleted without actually deleting:

```bash
git-batch-delete-branch --filter "old" --dry-run
```

### Force Deletion

Skip confirmation prompts:

```bash
git-batch-delete-branch --filter "temp" --force
```

### Include Merged Branches

By default, only unmerged branches are shown. Include merged branches:

```bash
git-batch-delete-branch --include-merged
```

### Verbose Output

Get detailed information about the process:

```bash
git-batch-delete-branch --verbose
```

## Options

| Option | Short | Description |
|--------|-------|-------------|
| `--filter <keyword>` | `-f` | Filter branches by keyword |
| `--regex <pattern>` | `-r` | Filter branches by regex pattern |
| `--dry-run` | | Preview mode (no actual deletion) |
| `--force` | | Force deletion (skip confirmation) |
| `--exclude` | | Exclude matching branches |
| `--include-merged` | | Include merged branches |
| `--verbose` | | Verbose output |
| `--help` | `-h` | Show help information |
| `--version` | `-v` | Show version information |

## Examples

### Delete Feature Branches

```bash
# Delete all feature branches
git-batch-delete-branch --filter "feature"

# Delete only merged feature branches
git-batch-delete-branch --filter "feature" --include-merged
```

### Delete Test Branches

```bash
# Delete branches containing "test"
git-batch-delete-branch --filter "test"

# Preview test branch deletion
git-batch-delete-branch --filter "test" --dry-run
```

### Delete Old Release Branches

```bash
# Delete release branches older than v1.0
git-batch-delete-branch --regex "release-v0\..*"

# Delete all release branches except the latest
git-batch-delete-branch --regex "release-.*" --exclude
```

### Clean Up Temporary Branches

```bash
# Delete temporary branches
git-batch-delete-branch --filter "temp"

# Delete branches with specific naming pattern
git-batch-delete-branch --regex "temp-.*|tmp-.*"
```

## Safety Features

- **Current Branch Protection**: The current branch is automatically excluded from deletion
- **Main Branch Protection**: Main/master branches are protected from deletion
- **Confirmation Prompts**: Users must confirm before deleting branches
- **Preview Mode**: See what would be deleted before executing
- **Error Handling**: Graceful handling of deletion failures

## Branch Status Indicators

The tool uses visual indicators to show branch status:

- 🟢 `*` - Current branch (protected)
- 🔒 `🔒` - Main branch (protected)
- ✓ `✓` - Merged branch
- ○ `○` - Unmerged branch
- 🗑️ `🗑️` - Branch to be deleted

## Output Examples

### Interactive Selection

```
📊 BRANCH STATISTICS:
Total branches: 8
Filtered branches: 5
Protected branches: 2
Merged branches: 3
Unmerged branches: 5

Found 5 branches:

○ feature/new-feature
✓ feature/old-feature (merged)
○ bugfix/issue-123
✓ hotfix/urgent-fix (merged)
○ temp/cleanup

Select branches to delete (use space to select/deselect):
```

### Deletion Results

```
📋 DELETE RESULTS:
Total processed: 3
Successfully deleted: 2
Failed to delete: 1

✅ SUCCESSFUL DELETIONS:
✓ feature/old-feature
✓ temp/cleanup

❌ FAILED DELETIONS:
✗ bugfix/issue-123: Delete operation failed
```

## Requirements

- Node.js >= 14.0.0
- Git repository
- Appropriate Git permissions

## Development

### Installation

```bash
git clone <repository-url>
cd git-batch-delete-branch
npm install
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:coverage
```

### Development Mode

```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## Support

If you encounter any issues or have questions, please:

1. Check the [documentation](README.md)
2. Search [existing issues](https://github.com/yourusername/git-batch-delete-branch/issues)
3. Create a new issue with detailed information

## Related Projects

- [git-branch-cleaner](https://github.com/example/git-branch-cleaner) - Alternative branch cleaning tool
- [git-tidy](https://github.com/example/git-tidy) - Git repository maintenance tool
