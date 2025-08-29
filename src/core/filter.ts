import { Branch, FilterOptions } from '../types';

export class Filter {
  /**
   * 根据关键词过滤分支
   */
  static filterByKeyword(branches: Branch[], keyword: string, options: FilterOptions = {}): Branch[] {
    const { exclude = false, caseSensitive = false } = options;
    const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase();
    
    return branches.filter(branch => {
      const branchName = caseSensitive ? branch.name : branch.name.toLowerCase();
      const matches = branchName.includes(searchKeyword);
      return exclude ? !matches : matches;
    });
  }

  /**
   * 根据正则表达式过滤分支
   */
  static filterByRegex(branches: Branch[], pattern: string, options: FilterOptions = {}): Branch[] {
    const { exclude = false, caseSensitive = false } = options;
    const flags = caseSensitive ? 'g' : 'gi';
    
    return branches.filter(branch => {
      const regex = new RegExp(pattern, flags);
      const matches = regex.test(branch.name);
      return exclude ? !matches : matches;
    });
  }

  /**
   * 过滤掉当前分支和主分支
   */
  static filterProtectedBranches(branches: Branch[]): Branch[] {
    return branches.filter(branch => !branch.isCurrent && !branch.isMain);
  }

  /**
   * 根据合并状态过滤分支
   */
  static filterByMergeStatus(branches: Branch[], includeMerged: boolean = false): Branch[] {
    if (includeMerged) {
      return branches; // 包含所有分支
    }
    return branches.filter(branch => !branch.isMerged); // 只包含未合并的分支
  }

  /**
   * 组合过滤条件
   */
  static filterBranches(branches: Branch[], options: FilterOptions): Branch[] {
    let filteredBranches = [...branches];

    // 首先过滤掉受保护的分支
    filteredBranches = this.filterProtectedBranches(filteredBranches);

    // 根据合并状态过滤
    if (options.includeMerged !== undefined) {
      filteredBranches = this.filterByMergeStatus(filteredBranches, options.includeMerged);
    }

    // 根据关键词过滤
    if (options.keyword) {
      filteredBranches = this.filterByKeyword(filteredBranches, options.keyword, options);
    }

    // 根据正则表达式过滤
    if (options.regex) {
      filteredBranches = this.filterByRegex(filteredBranches, options.regex, options);
    }

    return filteredBranches;
  }

  /**
   * 获取过滤统计信息
   */
  static getFilterStats(branches: Branch[], filteredBranches: Branch[]): {
    total: number;
    filtered: number;
    protected: number;
    merged: number;
    unmerged: number;
  } {
    const total = branches.length;
    const filtered = filteredBranches.length;
    const protectedCount = branches.filter(b => b.isCurrent || b.isMain).length;
    const merged = branches.filter(b => b.isMerged).length;
    const unmerged = branches.filter(b => !b.isMerged).length;

    return {
      total,
      filtered,
      protected: protectedCount,
      merged,
      unmerged
    };
  }

  /**
   * 验证过滤条件
   */
  static validateFilterOptions(options: FilterOptions): { valid: boolean; error?: string } {
    if (options.keyword && options.regex) {
      return { valid: false, error: 'Cannot use both keyword and regex filters simultaneously' };
    }

    if (options.keyword !== undefined && options.keyword.trim().length === 0) {
      return { valid: false, error: 'Keyword cannot be empty' };
    }

    if (options.regex) {
      try {
        new RegExp(options.regex);
      } catch {
        return { valid: false, error: 'Invalid regular expression pattern' };
      }
    }

    return { valid: true };
  }
}
