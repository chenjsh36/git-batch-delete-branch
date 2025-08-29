import { Validator } from '../../src/utils/validator';

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

const { execSync } = require('child_process');

describe('Validator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isGitRepository', () => {
    it('should return true for valid git repository', () => {
      (execSync as jest.Mock).mockReturnValue('.git');
      
      const result = Validator.isGitRepository();
      
      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith('git rev-parse --git-dir', { stdio: 'ignore' });
    });

    it('should return false for non-git repository', () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Not a git repository');
      });
      
      const result = Validator.isGitRepository();
      
      expect(result).toBe(false);
    });
  });

  describe('isValidRegex', () => {
    it('should return true for valid regex', () => {
      expect(Validator.isValidRegex('test.*')).toBe(true);
      expect(Validator.isValidRegex('[a-z]+')).toBe(true);
      expect(Validator.isValidRegex('\\d+')).toBe(true);
    });

    it('should return false for invalid regex', () => {
      expect(Validator.isValidRegex('[')).toBe(false);
      expect(Validator.isValidRegex('(unclosed')).toBe(false);
      expect(Validator.isValidRegex('\\')).toBe(false);
    });
  });

  describe('isValidBranchName', () => {
    it('should return true for valid branch names', () => {
      expect(Validator.isValidBranchName('main')).toBe(true);
      expect(Validator.isValidBranchName('feature/new-feature')).toBe(true);
      expect(Validator.isValidBranchName('bugfix/issue-123')).toBe(true);
      expect(Validator.isValidBranchName('hotfix_urgent_fix')).toBe(true);
      expect(Validator.isValidBranchName('release-v1.0.0')).toBe(true);
    });

    it('should return false for invalid branch names', () => {
      expect(Validator.isValidBranchName('')).toBe(false);
      expect(Validator.isValidBranchName('branch with spaces')).toBe(false);
      expect(Validator.isValidBranchName('branch@with#special')).toBe(false);
      expect(Validator.isValidBranchName('branch\nwith\nnewlines')).toBe(false);
    });
  });

  describe('hasUncommittedChanges', () => {
    it('should return true when there are uncommitted changes', () => {
      (execSync as jest.Mock).mockReturnValue('M  modified-file.txt\nA  new-file.txt');
      
      const result = Validator.hasUncommittedChanges();
      
      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith('git status --porcelain', { encoding: 'utf8' });
    });

    it('should return false when there are no uncommitted changes', () => {
      (execSync as jest.Mock).mockReturnValue('');
      
      const result = Validator.hasUncommittedChanges();
      
      expect(result).toBe(false);
    });

    it('should return false when git command fails', () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Git command failed');
      });
      
      const result = Validator.hasUncommittedChanges();
      
      expect(result).toBe(false);
    });
  });

  describe('hasUnpushedCommits', () => {
    it('should return true when there are unpushed commits', () => {
      (execSync as jest.Mock).mockReturnValue('abc123 commit message\n');
      
      const result = Validator.hasUnpushedCommits();
      
      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith('git log --branches --not --remotes --oneline', { encoding: 'utf8' });
    });

    it('should return false when there are no unpushed commits', () => {
      (execSync as jest.Mock).mockReturnValue('');
      
      const result = Validator.hasUnpushedCommits();
      
      expect(result).toBe(false);
    });

    it('should return false when git command fails', () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Git command failed');
      });
      
      const result = Validator.hasUnpushedCommits();
      
      expect(result).toBe(false);
    });
  });

  describe('validateFilterOptions', () => {
    it('should return valid for correct options', () => {
      const result = Validator.validateFilterOptions('test', undefined);
      expect(result.valid).toBe(true);
    });

    it('should return invalid when both keyword and regex are provided', () => {
      const result = Validator.validateFilterOptions('test', 'test.*');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cannot use both keyword and regex filters simultaneously');
    });

    it('should return invalid for empty keyword', () => {
      const result = Validator.validateFilterOptions('', undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Keyword cannot be empty');
    });

    it('should return invalid for invalid regex', () => {
      const result = Validator.validateFilterOptions(undefined, '[');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid regular expression pattern');
    });
  });

  describe('hasGitPermissions', () => {
    it('should return true when git permissions are available', () => {
      (execSync as jest.Mock).mockReturnValue('On branch main');
      
      const result = Validator.hasGitPermissions();
      
      expect(result).toBe(true);
      expect(execSync).toHaveBeenCalledWith('git status', { stdio: 'ignore' });
    });

    it('should return false when git permissions are not available', () => {
      (execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const result = Validator.hasGitPermissions();
      
      expect(result).toBe(false);
    });
  });
});
