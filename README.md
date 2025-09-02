# Git Branch Manager

A powerful CLI tool for managing Git branches with interactive delete and switch operations.

> **Command**: `gitt branch` - Interactive branch management

## Features

- 🎯 **Interactive Branch Management**: Choose between delete and switch operations
- 🗑️ **Batch Delete**: Choose branches to delete with a user-friendly interface
- 🔄 **Branch Switch**: Easily switch between branches with visual selection
- 🔍 **Keyword Filtering**: Filter branches by keyword with various matching options
- 📝 **Regex Filtering**: Use regular expressions for advanced branch filtering
- 🛡️ **Safety Features**: Automatic protection of current and main branches
- 👀 **Preview Mode**: Preview deletions before executing them
- 📊 **Statistics**: View detailed branch statistics and operation results
- 🎨 **Beautiful UI**: Colored output and progress indicators

## Installation

### Global Installation

```bash
npm install -g @shopee/git-batch-delete-branch
```

### Local Installation

```bash
npm install @shopee/git-batch-delete-branch
```

> **Note**: After installation, you can use `gitt branch` command for interactive branch management.

## Usage

### Interactive Branch Management

Run the main command to enter interactive mode:

```bash
git branch
```

This will show you branch statistics and let you choose between:
- 🗑️ **Delete branches** - Batch delete selected branches
- 🔄 **Switch branch** - Change to a different branch

### Delete Mode

#### Interactive Selection
```bash
gitt branch
# Then select "Delete branches" option
```

#### Keyword Filtering
```bash
# Delete branches containing "feature"
git delete --filter "feature"

# Delete branches containing "test" (case insensitive)
git delete -f "test"

# Exclude branches containing "main"
git delete --filter "main" --exclude
```

### Regex Filtering

Use regular expressions for advanced filtering:

```bash
# Delete branches matching pattern
git delete --regex "feature/.*"

# Delete branches matching case-sensitive pattern
git delete -r "RELEASE-.*"

# Exclude branches matching pattern
git delete --regex "hotfix/.*" --exclude
```

### Preview Mode

Preview what would be deleted without actually deleting:

```bash
git delete --filter "old" --dry-run
```

### Force Deletion

Skip confirmation prompts:

```bash
git delete --filter "temp" --force
```

### Switch Mode

Switch to a different branch:

```bash
gitt branch
# Then select "Switch branch" option
```

This will show you all available branches and let you select which one to switch to.

#### Direct Switch Command

You can also use the dedicated switch command:

```bash
gitt switch
```

This directly opens the branch selection interface for switching.

### Merge Mode

Merge a branch into the current branch:

```bash
gitt merge
```

This will:
1. Show you all available local branches (excluding the current branch)
2. Let you select which branch to merge
3. Perform the merge operation
4. Handle any merge conflicts gracefully

**Note**: Make sure you have committed or stashed any uncommitted changes before merging.

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

## Commands

| Command | Description |
|---------|-------------|
| `gitt branch` | Interactive branch management (delete or switch) |
| `gitt delete` | Delete branches with filtering options |
| `gitt switch` | Switch to another Git branch |
| `gitt merge` | Merge a branch into current branch |

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

### Interactive Branch Management

```bash
# Start interactive mode
gitt branch

# You'll see options:
# 🗑️  Delete branches (batch delete)
# 🔄 Switch branch (change current branch)
```

### Delete Feature Branches

```bash
# Delete all feature branches
git delete --filter "feature"

# Delete only merged feature branches
git delete --filter "feature" --include-merged
```

### Delete Test Branches

```bash
# Delete branches containing "test"
git delete --filter "test"

# Preview test branch deletion
git delete --filter "test" --dry-run
```

### Delete Old Release Branches

```bash
# Delete release branches older than v1.0
git delete --regex "release-v0\..*"

# Delete all release branches except the latest
git delete --regex "release-.*" --exclude
```

### Clean Up Temporary Branches

```bash
# Delete temporary branches
git delete --filter "temp"

# Delete branches with specific naming pattern
git delete --regex "temp-.*|tmp-.*"
```

### Switch Between Branches

```bash
# Interactive branch switching
gitt branch
# Select "Switch branch" option
# Choose from the list of available branches

# Direct branch switching
gitt switch
# Choose from the list of available branches
```

### Merge Branches

```bash
# Merge a branch into current branch
gitt merge
# Select the branch to merge from the list
# The selected branch will be merged into your current branch
```

## Safety Features

- **Current Branch Protection**: The current branch is automatically excluded from deletion
- **Main Branch Protection**: Main/master branches are protected from deletion
- **Confirmation Prompts**: Users must confirm before deleting branches
- **Preview Mode**: See what would be deleted before executing
- **Error Handling**: Graceful handling of deletion failures
- **Merge Safety**: Checks for uncommitted changes before merging
- **Branch Validation**: Ensures branches exist before operations
- **Conflict Handling**: Graceful handling of merge conflicts

## Branch Status Indicators

The tool uses visual indicators to show branch status:

- 🟢 `*` - Current branch (protected)
- 🔒 `🔒` - Main branch (protected)
- ✓ `✓` - Merged branch
- ○ `○` - Unmerged branch
- 🗑️ `🗑️` - Branch to be deleted
- 🔄 `🔄` - Branch to be switched to

## Output Examples

### Interactive Branch Management

```
📊 BRANCH STATISTICS:
Total branches: 8
Filtered branches: 5
Protected branches: 2
Merged branches: 3
Unmerged branches: 5

What would you like to do with branches?
🗑️  Delete branches (batch delete)
🔄 Switch branch (change current branch)
```

### Branch Selection for Deletion

```
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
git clone https://github.com/chenjsh36/git-batch-delete-branch.git
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
2. Search [existing issues](https://github.com/chenjsh36/git-batch-delete-branch/issues)
3. Create a new issue with detailed information

## Related Projects

- [git-branch-cleaner](https://github.com/example/git-branch-cleaner) - Alternative branch cleaning tool
- [git-tidy](https://github.com/example/git-tidy) - Git repository maintenance tool
