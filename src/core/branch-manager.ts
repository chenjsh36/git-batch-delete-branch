import { Branch, FilterOptions, DeleteOptions, BatchDeleteResult, DeleteResult } from '../types';
import { GitUtils } from './git-utils';
import { Filter } from './filter';
import { Validator } from '../utils/validator';
import { logger } from '../utils/logger';

export class BranchManager {
  private branches: Branch[] = [];

  constructor() {
    // 初始化时获取 Git 配置（如果需要的话）
  }

  /**
   * 初始化分支管理器
   */
  async initialize(options: { fetchRemoteInfo?: boolean; checkMergeStatus?: boolean } = {}): Promise<void> {
    try {
      // 验证 Git 仓库
      if (!Validator.isGitRepository()) {
        throw new Error('Not a Git repository');
      }

      // 检查权限
      if (!Validator.hasGitPermissions()) {
        throw new Error('No permission to access Git repository');
      }

      // 根据选项获取分支信息
      if (options.fetchRemoteInfo || options.checkMergeStatus) {
        this.branches = GitUtils.getAllBranches(options);
      } else {
        // 快速模式：不获取远程信息，不检查合并状态
        this.branches = GitUtils.getBranchesFast();
      }
      
      logger.debug(`Found ${this.branches.length} branches`);
    } catch (error) {
      logger.error(`Failed to initialize: ${error}`);
      throw error;
    }
  }

  /**
   * 获取过滤后的分支列表
   */
  getFilteredBranches(options: FilterOptions): Branch[] {
    // 验证过滤选项
    const validation = Filter.validateFilterOptions(options);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return Filter.filterBranches(this.branches, options);
  }

  /**
   * 获取分支统计信息
   */
  getBranchStats(options: FilterOptions = {}): {
    total: number;
    filtered: number;
    protected: number;
    merged: number;
    unmerged: number;
  } {
    const filteredBranches = this.getFilteredBranches(options);
    return Filter.getFilterStats(this.branches, filteredBranches);
  }

  /**
   * 批量删除分支
   */
  async deleteBranches(
    branchNames: string[],
    options: DeleteOptions = {}
  ): Promise<BatchDeleteResult> {
    const { dryRun = false, force = false, verbose = false } = options;
    
    if (verbose) {
      logger.setVerbose(true);
    }

    const results: DeleteResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    logger.info(`Starting to ${dryRun ? 'preview' : 'delete'} ${branchNames.length} branches`);

    for (const branchName of branchNames) {
      try {
        // 验证分支名称
        if (!Validator.isValidBranchName(branchName)) {
          results.push({
            success: false,
            branchName,
            error: 'Invalid branch name'
          });
          failedCount++;
          continue;
        }

        // 检查分支是否存在
        if (!GitUtils.branchExists(branchName)) {
          results.push({
            success: false,
            branchName,
            error: 'Branch does not exist'
          });
          failedCount++;
          continue;
        }

        // 检查是否为受保护分支
        const branch = this.branches.find(b => b.name === branchName);
        if (branch && (branch.isCurrent || branch.isMain)) {
          results.push({
            success: false,
            branchName,
            error: 'Cannot delete current or main branch'
          });
          failedCount++;
          continue;
        }

        if (dryRun) {
          logger.debug(`[DRY RUN] Would delete branch: ${branchName}`);
          results.push({
            success: true,
            branchName
          });
          successCount++;
        } else {
          // 实际删除分支
          const success = GitUtils.deleteBranch(branchName, force);
          if (success) {
            logger.debug(`Successfully deleted branch: ${branchName}`);
            results.push({
              success: true,
              branchName
            });
            successCount++;
          } else {
            logger.debug(`Failed to delete branch: ${branchName}`);
            results.push({
              success: false,
              branchName,
              error: 'Delete operation failed'
            });
            failedCount++;
          }
        }
      } catch (error) {
        logger.debug(`Error deleting branch ${branchName}: ${error}`);
        results.push({
          success: false,
          branchName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failedCount++;
      }
    }

    const result: BatchDeleteResult = {
      total: branchNames.length,
      success: successCount,
      failed: failedCount,
      results
    };

    // 输出结果摘要
    this.logDeleteSummary(result, dryRun);

    return result;
  }

  /**
   * 根据过滤条件删除分支
   */
  async deleteBranchesByFilter(
    filterOptions: FilterOptions,
    deleteOptions: DeleteOptions = {}
  ): Promise<BatchDeleteResult> {
    const filteredBranches = this.getFilteredBranches(filterOptions);
    
    if (filteredBranches.length === 0) {
      logger.warning('No branches match the filter criteria');
      return {
        total: 0,
        success: 0,
        failed: 0,
        results: []
      };
    }

    const branchNames = filteredBranches.map(branch => branch.name);
    return this.deleteBranches(branchNames, deleteOptions);
  }

  /**
   * 获取所有分支（包括受保护的）
   */
  getAllBranches(): Branch[] {
    return [...this.branches];
  }

  /**
   * 获取当前分支信息
   */
  getCurrentBranch(): Branch | undefined {
    return this.branches.find(branch => branch.isCurrent);
  }

  /**
   * 获取主分支信息
   */
  getMainBranch(): Branch | undefined {
    return this.branches.find(branch => branch.isMain);
  }

  /**
   * 刷新分支列表
   */
  async refreshBranches(): Promise<void> {
    this.branches = GitUtils.getAllBranches();
  }

  /**
   * 记录删除操作摘要
   */
  private logDeleteSummary(result: BatchDeleteResult, dryRun: boolean): void {
    const { total, success, failed } = result;
    const action = dryRun ? 'previewed' : 'deleted';

    logger.info(`\n${action.toUpperCase()} SUMMARY:`);
    logger.info(`Total branches: ${total}`);
    logger.success(`Successfully ${action}: ${success}`);
    
    if (failed > 0) {
      logger.error(`Failed to ${action}: ${failed}`);
    }

    if (dryRun) {
      logger.warning('This was a dry run. No branches were actually deleted.');
    }
  }

  /**
   * 切换分支
   */
  async switchBranch(branchName: string): Promise<boolean> {
    try {
      // 检查分支是否存在
      if (!this.branches.find(branch => branch.name === branchName)) {
        logger.error(`Branch '${branchName}' does not exist`);
        return false;
      }

      // 检查是否已经是当前分支
      const currentBranch = this.getCurrentBranch();
      if (currentBranch && currentBranch.name === branchName) {
        logger.info(`Already on branch '${branchName}'`);
        return true;
      }

      // 执行分支切换
      const success = GitUtils.switchBranch(branchName);
      
      if (success) {
        // 刷新分支列表以更新当前分支状态
        await this.refreshBranches();
      }
      
      return success;
    } catch (error) {
      logger.error(`Failed to switch to branch '${branchName}': ${error}`);
      return false;
    }
  }
}
