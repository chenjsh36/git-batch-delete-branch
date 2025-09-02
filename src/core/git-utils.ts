import { execSync } from 'child_process';
import { Branch, GitConfig } from '../types';
import { logger } from '../utils/logger';

export class GitUtils {
  /**
   * 获取当前 Git 配置信息
   */
  static getGitConfig(): GitConfig {
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const repositoryPath = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
      
      // 尝试获取主分支名称
      let mainBranch = 'main';
      try {
        const mainBranchResult = execSync('git symbolic-ref refs/remotes/origin/HEAD', { encoding: 'utf8' });
        const parts = mainBranchResult.split('/');
        const extractedBranch = parts[parts.length - 1]?.trim();
        if (extractedBranch && extractedBranch.length > 0) {
          mainBranch = extractedBranch;
        }
      } catch {
        // 如果无法获取远程主分支，尝试本地主分支
        try {
          const localMain = execSync('git branch -r | grep "origin/main"', { encoding: 'utf8' });
          if (localMain) mainBranch = 'main';
        } catch {
          try {
            const localMaster = execSync('git branch -r | grep "origin/master"', { encoding: 'utf8' });
            if (localMaster) mainBranch = 'master';
          } catch {
            // 默认使用 main
            mainBranch = 'main';
          }
        }
      }

      return {
        currentBranch,
        mainBranch,
        repositoryPath
      };
    } catch (error) {
      throw new Error('Failed to get Git configuration');
    }
  }

  /**
   * 获取所有本地分支
   */
  static getAllBranches(): Branch[] {
    try {
      const config = this.getGitConfig();
      const branchesOutput = execSync('git branch --format="%(refname:short) %(HEAD) %(committerdate:iso)"', { encoding: 'utf8' });
      
      const branches: Branch[] = [];
      const lines = branchesOutput.trim().split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const parts = line.split(' ');
        const branchName = parts[0];
        const isCurrent = parts[1] === '*';
        const isMain = branchName === config.mainBranch!;
        
        // 获取最后提交信息
        const lastCommit = execSync(`git log -1 --format="%h %s" ${branchName}`, { encoding: 'utf8' }).trim();
        const lastCommitDate = execSync(`git log -1 --format="%ci" ${branchName}`, { encoding: 'utf8' }).trim();
        
        // 检查是否已合并到主分支
        const isMerged = this.isBranchMerged(branchName, config.mainBranch!);
        
        branches.push({
          name: branchName,
          isCurrent,
          isMain,
          lastCommit,
          lastCommitDate,
          isMerged
        });
      }
      
      return branches;
    } catch (error) {
      logger.error('Failed to get branches');
      throw error;
    }
  }

  /**
   * 检查分支是否已合并到主分支
   */
  static isBranchMerged(branchName: string, mainBranch: string): boolean {
    try {
      execSync(`git branch --merged ${mainBranch} | grep -w "${branchName}"`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 删除单个分支
   */
  static deleteBranch(branchName: string, force: boolean = false): boolean {
    try {
      const command = force ? `git branch -D ${branchName}` : `git branch -d ${branchName}`;
      execSync(command, { stdio: 'ignore' });
      return true;
    } catch (error) {
      logger.debug(`Failed to delete branch ${branchName}: ${error}`);
      return false;
    }
  }

  /**
   * 批量删除分支
   */
  static deleteBranches(branchNames: string[], force: boolean = false): { success: string[], failed: string[] } {
    const success: string[] = [];
    const failed: string[] = [];
    
    for (const branchName of branchNames) {
      if (this.deleteBranch(branchName, force)) {
        success.push(branchName);
      } else {
        failed.push(branchName);
      }
    }
    
    return { success, failed };
  }

  /**
   * 获取分支详细信息
   */
  static getBranchInfo(branchName: string): {
    lastCommit: string;
    lastCommitDate: string;
    author: string;
    isMerged: boolean;
  } {
    try {
      const lastCommit = execSync(`git log -1 --format="%h %s" ${branchName}`, { encoding: 'utf8' }).trim();
      const lastCommitDate = execSync(`git log -1 --format="%ci" ${branchName}`, { encoding: 'utf8' }).trim();
      const author = execSync(`git log -1 --format="%an" ${branchName}`, { encoding: 'utf8' }).trim();
      const config = this.getGitConfig();
      const isMerged = this.isBranchMerged(branchName, config.mainBranch!);
      
      return {
        lastCommit,
        lastCommitDate,
        author,
        isMerged
      };
    } catch (error) {
      throw new Error(`Failed to get branch info for ${branchName}`);
    }
  }

  /**
   * 检查分支是否存在
   */
  static branchExists(branchName: string): boolean {
    try {
      execSync(`git show-ref --verify --quiet refs/heads/${branchName}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取远程分支列表
   */
  static getRemoteBranches(): string[] {
    try {
      const output = execSync('git branch -r --format="%(refname:short)"', { encoding: 'utf8' });
      return output.trim().split('\n').filter(branch => branch.trim());
    } catch {
      return [];
    }
  }

  /**
   * 检查是否有未提交的更改
   */
  static hasUncommittedChanges(): boolean {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
      return status.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * 切换分支
   */
  static switchBranch(branchName: string): boolean {
    try {
      // 检查是否有未提交的更改
      if (this.hasUncommittedChanges()) {
        logger.warning('You have uncommitted changes. Please commit or stash them before switching branches.');
        return false;
      }

      // 执行分支切换
      execSync(`git checkout ${branchName}`, { stdio: 'ignore' });
      return true;
    } catch (error) {
      logger.error(`Failed to switch to branch '${branchName}': ${error}`);
      return false;
    }
  }

  /**
   * 合并分支到当前分支
   */
  static mergeBranch(branchName: string): boolean {
    try {
      // 执行合并
      execSync(`git merge ${branchName}`, { stdio: 'inherit' });
      return true;
    } catch (error) {
      logger.error(`Failed to merge branch '${branchName}': ${error}`);
      return false;
    }
  }
}
