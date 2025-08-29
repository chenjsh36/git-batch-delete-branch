#!/usr/bin/env node

/**
 * Basic usage example for git-batch-delete-branch
 * This example demonstrates how to use the package programmatically
 */

const { BranchManager } = require('../dist/index');

async function example() {
  try {
    // Initialize the branch manager
    const branchManager = new BranchManager();
    await branchManager.initialize();

    console.log('=== Git Batch Delete Branch - Basic Usage Example ===\n');

    // Get all branches
    const allBranches = branchManager.getAllBranches();
    console.log(`Total branches found: ${allBranches.length}`);

    // Get branch statistics
    const stats = branchManager.getBranchStats();
    console.log('\nBranch Statistics:');
    console.log(`- Total: ${stats.total}`);
    console.log(`- Protected: ${stats.protected}`);
    console.log(`- Merged: ${stats.merged}`);
    console.log(`- Unmerged: ${stats.unmerged}`);

    // Example 1: Filter branches by keyword
    console.log('\n=== Example 1: Filter by keyword "feature" ===');
    const featureBranches = branchManager.getFilteredBranches({ keyword: 'feature' });
    console.log(`Found ${featureBranches.length} feature branches:`);
    featureBranches.forEach(branch => {
      console.log(`  - ${branch.name} ${branch.isMerged ? '(merged)' : '(unmerged)'}`);
    });

    // Example 2: Filter branches by regex
    console.log('\n=== Example 2: Filter by regex "bugfix/.*" ===');
    const bugfixBranches = branchManager.getFilteredBranches({ regex: 'bugfix/.*' });
    console.log(`Found ${bugfixBranches.length} bugfix branches:`);
    bugfixBranches.forEach(branch => {
      console.log(`  - ${branch.name} ${branch.isMerged ? '(merged)' : '(unmerged)'}`);
    });

    // Example 3: Get only unmerged branches
    console.log('\n=== Example 3: Unmerged branches only ===');
    const unmergedBranches = branchManager.getFilteredBranches({ includeMerged: false });
    console.log(`Found ${unmergedBranches.length} unmerged branches:`);
    unmergedBranches.forEach(branch => {
      console.log(`  - ${branch.name}`);
    });

    // Example 4: Preview deletion (dry run)
    console.log('\n=== Example 4: Preview deletion ===');
    if (featureBranches.length > 0) {
      console.log('Previewing deletion of feature branches...');
      const result = await branchManager.deleteBranches(
        featureBranches.map(b => b.name),
        { dryRun: true }
      );
      console.log(`Would delete ${result.success} branches`);
    }

    console.log('\n=== Example completed successfully ===');

  } catch (error) {
    console.error('Error in example:', error.message);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  example();
}

module.exports = { example };
