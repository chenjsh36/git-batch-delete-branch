import { execSync } from 'child_process';
import { logger } from './logger';

export class Validator {
  /**
   * 检查当前目录是否为 Git 仓库
   */
  static isGitRepository(): boolean {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证正则表达式是否有效
   */
  static isValidRegex(pattern: string): boolean {
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证分支名称是否有效
   */
  static isValidBranchName(branchName: string): boolean {
    // Git 分支名称规则
    const branchNameRegex = /^[a-zA-Z0-9/._-]+$/;
    return branchNameRegex.test(branchName) && branchName.length > 0;
  }

  /**
   * 检查是否有未提交的更改
   */
  static hasUncommittedChanges(): boolean {
    try {
      const result = execSync('git status --porcelain', { encoding: 'utf8' });
      return result.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * 检查是否有未推送的提交
   */
  static hasUnpushedCommits(): boolean {
    try {
      const result = execSync('git log --branches --not --remotes --oneline', { encoding: 'utf8' });
      return result.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * 验证过滤选项
   */
  static validateFilterOptions(keyword?: string, regex?: string): { valid: boolean; error?: string } {
    if (keyword && regex) {
      return { valid: false, error: 'Cannot use both keyword and regex filters simultaneously' };
    }

    if (regex && !this.isValidRegex(regex)) {
      return { valid: false, error: 'Invalid regular expression pattern' };
    }

    if (keyword !== undefined && keyword.trim().length === 0) {
      return { valid: false, error: 'Keyword cannot be empty' };
    }

    return { valid: true };
  }

  /**
   * 检查是否有足够的权限执行 Git 操作
   */
  static hasGitPermissions(): boolean {
    try {
      execSync('git status', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}
