import inquirer from 'inquirer';
import { Branch, InteractiveChoice } from '../types';
import { Display } from './display';
import { logger } from '../utils/logger';

export class Interactive {
  /**
   * 交互式选择分支
   */
  static async selectBranches(branches: Branch[]): Promise<string[]> {
    if (branches.length === 0) {
      logger.warning('No branches available for selection');
      return [];
    }

    // 显示分支列表
    Display.displayBranches(branches, true);

    // 创建选择项
    const choices: InteractiveChoice[] = branches.map(branch => ({
      name: this.formatBranchChoice(branch),
      value: branch.name,
      checked: false
    }));

    // 添加全选/取消全选选项
    choices.unshift(
      { name: 'Select All', value: 'select-all' },
      { name: 'Deselect All', value: 'deselect-all' }
    );

    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedBranches',
        message: 'Select branches to delete (use space to select/deselect):',
        choices,
        pageSize: 20,
        validate: (input: string[]) => {
          const actualBranches = input.filter(choice => choice !== 'select-all' && choice !== 'deselect-all');
          if (actualBranches.length === 0) {
            return 'Please select at least one branch';
          }
          return true;
        }
      }
    ]);

    let selectedBranches = answers.selectedBranches;

    // 处理全选/取消全选
    if (selectedBranches.includes('select-all')) {
      selectedBranches = branches.map(branch => branch.name);
    } else if (selectedBranches.includes('deselect-all')) {
      selectedBranches = [];
    } else {
      // 过滤掉控制选项
      selectedBranches = selectedBranches.filter((choice: string) => 
        choice !== 'select-all' && choice !== 'deselect-all'
      );
    }

    return selectedBranches;
  }

  /**
   * 确认删除操作
   */
  static async confirmDeletion(branchNames: string[], dryRun: boolean = false): Promise<boolean> {
    if (branchNames.length === 0) {
      return false;
    }

    const action = dryRun ? 'preview' : 'delete';
    const branchesText = branchNames.length === 1 ? 'branch' : 'branches';

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to ${action} ${branchNames.length} ${branchesText}?`,
        default: false
      }
    ]);

    return answers.confirm;
  }

  /**
   * 确认强制删除
   */
  static async confirmForceDeletion(branchNames: string[]): Promise<boolean> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `⚠️  WARNING: You are about to force delete ${branchNames.length} branches. This action cannot be undone. Continue?`,
        default: false
      }
    ]);

    return answers.confirm;
  }

  /**
   * 选择过滤模式
   */
  static async selectFilterMode(): Promise<'keyword' | 'regex' | 'interactive'> {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'filterMode',
        message: 'Select filter mode:',
        choices: [
          { name: 'Interactive Selection', value: 'interactive' },
          { name: 'Keyword Filter', value: 'keyword' },
          { name: 'Regex Filter', value: 'regex' }
        ]
      }
    ]);

    return answers.filterMode;
  }

  /**
   * 输入关键词
   */
  static async inputKeyword(): Promise<string> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'keyword',
        message: 'Enter keyword to filter branches:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Keyword cannot be empty';
          }
          return true;
        }
      }
    ]);

    return answers.keyword.trim();
  }

  /**
   * 输入正则表达式
   */
  static async inputRegex(): Promise<string> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'regex',
        message: 'Enter regex pattern to filter branches:',
        validate: (input: string) => {
          if (!input.trim()) {
            return 'Regex pattern cannot be empty';
          }
          try {
            new RegExp(input);
            return true;
          } catch {
            return 'Invalid regex pattern';
          }
        }
      }
    ]);

    return answers.regex.trim();
  }

  /**
   * 选择过滤选项
   */
  static async selectFilterOptions(): Promise<{
    exclude: boolean;
    includeMerged: boolean;
    caseSensitive: boolean;
  }> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'exclude',
        message: 'Exclude matching branches instead of including them?',
        default: false
      },
      {
        type: 'confirm',
        name: 'includeMerged',
        message: 'Include merged branches?',
        default: false
      },
      {
        type: 'confirm',
        name: 'caseSensitive',
        message: 'Case sensitive matching?',
        default: false
      }
    ]);

    return answers;
  }

  /**
   * 格式化分支选择项
   */
  private static formatBranchChoice(branch: Branch): string {
    let prefix = '';
    let name = branch.name;

    if (branch.isCurrent) {
      prefix = '🟢 ';
      name = `${name} (current)`;
    } else if (branch.isMain) {
      prefix = '🔒 ';
      name = `${name} (main)`;
    } else if (branch.isMerged) {
      prefix = '✓ ';
      name = `${name} (merged)`;
    } else {
      prefix = '○ ';
    }

    return `${prefix}${name}`;
  }

  /**
   * 显示分支预览并确认
   */
  static async previewAndConfirm(branches: Branch[], dryRun: boolean = false): Promise<boolean> {
    if (branches.length === 0) {
      logger.warning('No branches match the filter criteria');
      return false;
    }

    // 显示预览
    Display.displayDeletePreview(branches);

    // 确认删除
    const branchNames = branches.map(branch => branch.name);
    return this.confirmDeletion(branchNames, dryRun);
  }

  /**
   * 处理错误并询问是否继续
   */
  static async handleErrorAndContinue(error: string): Promise<boolean> {
    logger.error(error);
    
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Do you want to continue with other operations?',
        default: false
      }
    ]);

    return answers.continue;
  }
}
