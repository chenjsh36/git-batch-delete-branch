import chalk from 'chalk';
import { Branch } from '../types';
import { logger } from '../utils/logger';

export class Display {
  /**
   * 显示分支列表
   */
  static displayBranches(branches: Branch[], showDetails: boolean = false): void {
    if (branches.length === 0) {
      logger.info('No branches found');
      return;
    }

    logger.info(`Found ${branches.length} branches:\n`);

    branches.forEach((branch) => {
      const prefix = this.getBranchPrefix(branch);
      const name = this.formatBranchName(branch);
      const details = showDetails ? this.getBranchDetails(branch) : '';
      
      console.log(`${prefix} ${name}${details}`);
    });
  }

  /**
   * 显示分支统计信息
   */
  static displayStats(stats: {
    total: number;
    filtered: number;
    protected: number;
    merged: number;
    unmerged: number;
  }): void {
    console.log('\n' + chalk.cyan('📊 BRANCH STATISTICS:'));
    console.log(`Total branches: ${chalk.white(stats.total)}`);
    console.log(`Filtered branches: ${chalk.yellow(stats.filtered)}`);
    console.log(`Protected branches: ${chalk.red(stats.protected)}`);
    console.log(`Merged branches: ${chalk.green(stats.merged)}`);
    console.log(`Unmerged branches: ${chalk.blue(stats.unmerged)}`);
  }

  /**
   * 显示删除预览
   */
  static displayDeletePreview(branches: Branch[]): void {
    if (branches.length === 0) {
      logger.warning('No branches to delete');
      return;
    }

    console.log('\n' + chalk.yellow('⚠️  BRANCHES TO BE DELETED:'));
    branches.forEach((branch) => {
      const prefix = chalk.red('🗑️');
      const name = this.formatBranchName(branch);
      console.log(`${prefix} ${name}`);
    });

    console.log(`\n${chalk.yellow('Total branches to delete:')} ${chalk.white(branches.length)}`);
  }

  /**
   * 显示删除结果
   */
  static displayDeleteResults(results: {
    total: number;
    success: number;
    failed: number;
    results: Array<{ success: boolean; branchName: string; error?: string }>;
  }): void {
    const { total, success, failed, results: deleteResults } = results;

    console.log('\n' + chalk.cyan('📋 DELETE RESULTS:'));
    console.log(`Total processed: ${chalk.white(total)}`);
    console.log(`Successfully deleted: ${chalk.green(success)}`);
    console.log(`Failed to delete: ${chalk.red(failed)}`);

    if (failed > 0) {
      console.log('\n' + chalk.red('❌ FAILED DELETIONS:'));
      deleteResults
        .filter(result => !result.success)
        .forEach(result => {
          console.log(`${chalk.red('✗')} ${result.branchName}: ${chalk.gray(result.error)}`);
        });
    }

    if (success > 0) {
      console.log('\n' + chalk.green('✅ SUCCESSFUL DELETIONS:'));
      deleteResults
        .filter(result => result.success)
        .forEach(result => {
          console.log(`${chalk.green('✓')} ${result.branchName}`);
        });
    }
  }

  /**
   * 显示帮助信息
   */
  static displayHelp(): void {
    console.log(chalk.cyan('Git Batch Delete Branch - Help\n'));
    
    console.log(chalk.white('USAGE:'));
    console.log('  git-batch-delete-branch [options]\n');
    
    console.log(chalk.white('OPTIONS:'));
    console.log('  -f, --filter <keyword>     Filter branches by keyword');
    console.log('  -r, --regex <pattern>      Filter branches by regex pattern');
    console.log('  --dry-run                  Preview mode (no actual deletion)');
    console.log('  --force                    Force deletion (skip confirmation)');
    console.log('  --exclude                  Exclude matching branches');
    console.log('  --include-merged           Include merged branches');
    console.log('  --verbose                  Verbose output');
    console.log('  -h, --help                 Show this help message');
    console.log('  -v, --version              Show version information\n');
    
    console.log(chalk.white('EXAMPLES:'));
    console.log('  git-batch-delete-branch                    # Interactive mode');
    console.log('  git-batch-delete-branch -f "feature"       # Delete branches containing "feature"');
    console.log('  git-batch-delete-branch -r "feature/.*"    # Delete branches matching regex');
    console.log('  git-batch-delete-branch -f "test" --dry-run # Preview deletion');
    console.log('  git-batch-delete-branch -f "old" --force   # Force delete without confirmation');
  }

  /**
   * 获取分支前缀
   */
  private static getBranchPrefix(branch: Branch): string {
    if (branch.isCurrent) {
      return chalk.green('*');
    }
    if (branch.isMain) {
      return chalk.red('🔒');
    }
    if (branch.isMerged) {
      return chalk.gray('✓');
    }
    return chalk.yellow('○');
  }

  /**
   * 格式化分支名称
   */
  private static formatBranchName(branch: Branch): string {
    let name = branch.name;
    
    if (branch.isCurrent) {
      name = chalk.green(name);
    } else if (branch.isMain) {
      name = chalk.red(name);
    } else if (branch.isMerged) {
      name = chalk.gray(name);
    } else {
      name = chalk.white(name);
    }
    
    return name;
  }

  /**
   * 获取分支详细信息
   */
  private static getBranchDetails(branch: Branch): string {
    const details = [];
    
    if (branch.isCurrent) {
      details.push(chalk.green('(current)'));
    }
    if (branch.isMain) {
      details.push(chalk.red('(main)'));
    }
    if (branch.isMerged) {
      details.push(chalk.gray('(merged)'));
    }
    
    if (details.length > 0) {
      return ' ' + details.join(' ');
    }
    
    return '';
  }

  /**
   * 显示错误信息
   */
  static displayError(error: string): void {
    console.log('\n' + chalk.red('❌ ERROR:'));
    console.log(chalk.red(error));
  }

  /**
   * 显示警告信息
   */
  static displayWarning(warning: string): void {
    console.log('\n' + chalk.yellow('⚠️  WARNING:'));
    console.log(chalk.yellow(warning));
  }

  /**
   * 显示成功信息
   */
  static displaySuccess(message: string): void {
    console.log('\n' + chalk.green('✅ SUCCESS:'));
    console.log(chalk.green(message));
  }
}
