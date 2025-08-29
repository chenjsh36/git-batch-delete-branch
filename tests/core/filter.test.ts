import { Filter } from '../../src/core/filter';
import { Branch } from '../../src/types';

describe('Filter', () => {
  const mockBranches: Branch[] = [
    {
      name: 'main',
      isCurrent: false,
      isMain: true,
      lastCommit: 'abc123 Initial commit',
      lastCommitDate: '2023-01-01',
      isMerged: true
    },
    {
      name: 'feature/new-feature',
      isCurrent: true,
      isMain: false,
      lastCommit: 'def456 Add new feature',
      lastCommitDate: '2023-01-02',
      isMerged: false
    },
    {
      name: 'feature/old-feature',
      isCurrent: false,
      isMain: false,
      lastCommit: 'ghi789 Old feature',
      lastCommitDate: '2023-01-03',
      isMerged: true
    },
    {
      name: 'bugfix/issue-123',
      isCurrent: false,
      isMain: false,
      lastCommit: 'jkl012 Fix issue',
      lastCommitDate: '2023-01-04',
      isMerged: false
    },
    {
      name: 'hotfix/urgent-fix',
      isCurrent: false,
      isMain: false,
      lastCommit: 'mno345 Urgent fix',
      lastCommitDate: '2023-01-05',
      isMerged: true
    }
  ];

  describe('filterByKeyword', () => {
    it('should filter branches by keyword', () => {
      const result = Filter.filterByKeyword(mockBranches, 'feature');
      expect(result).toHaveLength(2);
      expect(result.every(branch => branch.name.includes('feature'))).toBe(true);
    });

    it('should be case insensitive by default', () => {
      const result = Filter.filterByKeyword(mockBranches, 'FEATURE');
      expect(result).toHaveLength(2);
    });

    it('should be case sensitive when option is set', () => {
      const result = Filter.filterByKeyword(mockBranches, 'FEATURE', { caseSensitive: true });
      expect(result).toHaveLength(0);
    });

    it('should exclude matching branches when exclude is true', () => {
      const result = Filter.filterByKeyword(mockBranches, 'feature', { exclude: true });
      expect(result).toHaveLength(3);
      expect(result.every(branch => !branch.name.includes('feature'))).toBe(true);
    });
  });

  describe('filterByRegex', () => {
    it('should filter branches by regex pattern', () => {
      const result = Filter.filterByRegex(mockBranches, 'feature/.*');
      expect(result).toHaveLength(2);
      expect(result.every(branch => /feature\/.*/.test(branch.name))).toBe(true);
    });

    it('should be case insensitive by default', () => {
      const result = Filter.filterByRegex(mockBranches, 'FEATURE/.*');
      expect(result).toHaveLength(2);
    });

    it('should be case sensitive when option is set', () => {
      const result = Filter.filterByRegex(mockBranches, 'FEATURE/.*', { caseSensitive: true });
      expect(result).toHaveLength(0);
    });

    it('should exclude matching branches when exclude is true', () => {
      const result = Filter.filterByRegex(mockBranches, 'feature/.*', { exclude: true });
      expect(result).toHaveLength(3);
      expect(result.every(branch => !/feature\/.*/.test(branch.name))).toBe(true);
    });
  });

  describe('filterProtectedBranches', () => {
    it('should filter out current and main branches', () => {
      const result = Filter.filterProtectedBranches(mockBranches);
      expect(result).toHaveLength(3);
      expect(result.every(branch => !branch.isCurrent && !branch.isMain)).toBe(true);
    });
  });

  describe('filterByMergeStatus', () => {
    it('should filter out merged branches by default', () => {
      const result = Filter.filterByMergeStatus(mockBranches);
      expect(result).toHaveLength(2);
      expect(result.every(branch => !branch.isMerged)).toBe(true);
    });

    it('should include all branches when includeMerged is true', () => {
      const result = Filter.filterByMergeStatus(mockBranches, true);
      expect(result).toHaveLength(5);
    });
  });

  describe('filterBranches', () => {
    it('should combine all filter conditions', () => {
      const result = Filter.filterBranches(mockBranches, {
        keyword: 'feature',
        includeMerged: false
      });
      expect(result).toHaveLength(0); // No feature branches after filtering (current branch is protected)
    });

    it('should handle empty options', () => {
      const result = Filter.filterBranches(mockBranches, {});
      expect(result).toHaveLength(3); // All non-protected, non-merged branches
    });
  });

  describe('getFilterStats', () => {
    it('should return correct statistics', () => {
      const filteredBranches = Filter.filterBranches(mockBranches, { keyword: 'feature' });
      const stats = Filter.getFilterStats(mockBranches, filteredBranches);
      
      expect(stats.total).toBe(5);
      expect(stats.filtered).toBe(1); // Only feature/old-feature (feature/new-feature is current branch)
      expect(stats.protected).toBe(2); // main + current
      expect(stats.merged).toBe(3);
      expect(stats.unmerged).toBe(2);
    });
  });

  describe('validateFilterOptions', () => {
    it('should return valid for correct options', () => {
      const result = Filter.validateFilterOptions({ keyword: 'test' });
      expect(result.valid).toBe(true);
    });

    it('should return invalid when both keyword and regex are provided', () => {
      const result = Filter.validateFilterOptions({ keyword: 'test', regex: 'test.*' });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cannot use both keyword and regex filters simultaneously');
    });

    it('should return invalid for empty keyword', () => {
      const result = Filter.validateFilterOptions({ keyword: '' });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Keyword cannot be empty');
    });

    it('should return invalid for invalid regex', () => {
      const result = Filter.validateFilterOptions({ regex: '[' });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid regular expression pattern');
    });
  });
});
