#!/usr/bin/env node

import { Command } from 'commander';
import { BranchManager } from './core/branch-manager';
import { Interactive } from './ui/interactive';
import { Display } from './ui/display';
import { logger } from './utils/logger';
import { Validator } from './utils/validator';
import { FilterOptions, DeleteOptions } from './types';

const program = new Command();

// 设置版本信息
const packageJson = require('../package.json');
program.version(packageJson.version);

// 主命令
program
  .name('gitt')
  .description('Git branch management tool with interactive delete and switch options');

// branch 子命令
program
  .command('branch')
  .description('Manage Git branches')
  .action(async () => {
    try {
      await runBranchManager();
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'An unknown error occurred');
      process.exit(1);
    }
  });

// delete 子命令 (保留原有功能)
program
  .command('delete')
  .description('Delete Git branches with filtering options')
  .option('-f, --filter <keyword>', 'Filter branches by keyword')
  .option('-r, --regex <pattern>', 'Filter branches by regex pattern')
  .option('--dry-run', 'Preview mode (no actual deletion)')
  .option('--force', 'Force deletion (skip confirmation)')
  .option('--exclude', 'Exclude matching branches')
  .option('--include-merged', 'Include merged branches')
  .option('--verbose', 'Verbose output')
  .action(async (options) => {
    try {
      await runDeleteMode(options);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'An unknown error occurred');
      process.exit(1);
    }
  });

// 帮助命令
program
  .command('help')
  .description('Show detailed help information')
  .action(() => {
    Display.displayHelp();
  });

async function runBranchManager(): Promise<void> {
  // 检查 Git 仓库
  if (!Validator.isGitRepository()) {
    throw new Error('Not a Git repository. Please run this command from a Git repository directory.');
  }

  // 初始化分支管理器
  const branchManager = new BranchManager();
  await branchManager.initialize();

  // 获取分支统计信息
  const stats = branchManager.getBranchStats();

  // 显示统计信息
  Display.displayStats(stats);

  // 选择操作模式
  const mode = await Interactive.selectBranchMode();
  
  if (mode === 'delete') {
    await runDeleteMode({});
  } else if (mode === 'switch') {
    await runSwitchMode(branchManager);
  }
}

async function runDeleteMode(options: any): Promise<void> {
  // 设置日志级别
  if (options.verbose) {
    logger.setVerbose(true);
  }

  // 检查 Git 仓库
  if (!Validator.isGitRepository()) {
    throw new Error('Not a Git repository. Please run this command from a Git repository directory.');
  }

  // 初始化分支管理器
  const branchManager = new BranchManager();
  await branchManager.initialize();

  // 获取分支统计信息
  const stats = branchManager.getBranchStats();

  // 显示统计信息
  Display.displayStats(stats);

  // 确定操作模式
  if (options.filter || options.regex) {
    // 过滤模式
    await runFilterMode(branchManager, options);
  } else {
    // 交互模式
    await runInteractiveMode(branchManager);
  }
}

async function runSwitchMode(branchManager: BranchManager): Promise<void> {
  // 获取所有分支（包括当前分支）
  const allBranches = branchManager.getAllBranches();
  
  if (allBranches.length === 0) {
    logger.info('No branches found');
    return;
  }

  // 显示分支列表供选择
  Display.displayBranchList(allBranches, true);
  
  // 选择要切换的分支
  const selectedBranch = await Interactive.selectBranchToSwitch(allBranches);
  
  if (selectedBranch) {
    // 执行分支切换
    const success = await branchManager.switchBranch(selectedBranch);
    if (success) {
      logger.info(`Successfully switched to branch: ${selectedBranch}`);
    } else {
      logger.error(`Failed to switch to branch: ${selectedBranch}`);
    }
  }
}

async function runFilterMode(branchManager: BranchManager, options: any): Promise<void> {
  const filterOptions: FilterOptions = {
    keyword: options.filter,
    regex: options.regex,
    exclude: options.exclude,
    includeMerged: options.includeMerged,
    caseSensitive: false // 可以通过选项添加
  };

  const deleteOptions: DeleteOptions = {
    dryRun: options.dryRun,
    force: options.force,
    verbose: options.verbose
  };

  // 验证过滤选项
  const validation = Validator.validateFilterOptions(filterOptions.keyword, filterOptions.regex);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 获取过滤后的分支
  const filteredBranches = branchManager.getFilteredBranches(filterOptions);

  if (filteredBranches.length === 0) {
    logger.warning('No branches match the filter criteria');
    return;
  }

  // 显示预览
  Display.displayDeletePreview(filteredBranches);

  // 确认删除
  let shouldDelete = true;
  if (!options.force && !options.dryRun) {
    const branchNames = filteredBranches.map(branch => branch.name);
    shouldDelete = await Interactive.confirmDeletion(branchNames, options.dryRun);
  }

  if (shouldDelete) {
    // 执行删除
    const result = await branchManager.deleteBranchesByFilter(filterOptions, deleteOptions);
    Display.displayDeleteResults(result);
  } else {
    logger.info('Operation cancelled');
  }
}

async function runInteractiveMode(branchManager: BranchManager): Promise<void> {
  // 获取可删除的分支（排除当前分支和主分支）
  const deletableBranches = branchManager.getFilteredBranches({});

  if (deletableBranches.length === 0) {
    logger.info('No branches available for deletion');
    return;
  }

  // 交互式选择分支
  const selectedBranchNames = await Interactive.selectBranches(deletableBranches);

  if (selectedBranchNames.length === 0) {
    logger.info('No branches selected');
    return;
  }

  // 确认删除
  const shouldDelete = await Interactive.confirmDeletion(selectedBranchNames);

  if (shouldDelete) {
    // 执行删除
    const result = await branchManager.deleteBranches(selectedBranchNames);
    Display.displayDeleteResults(result);
  } else {
    logger.info('Operation cancelled');
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// 解析命令行参数
program.parse();
