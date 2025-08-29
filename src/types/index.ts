export interface Branch {
  name: string;
  isCurrent: boolean;
  isMain: boolean;
  lastCommit: string;
  lastCommitDate: string;
  isMerged: boolean;
}

export interface FilterOptions {
  keyword?: string;
  regex?: string;
  exclude?: boolean;
  includeMerged?: boolean;
  caseSensitive?: boolean;
}

export interface DeleteOptions {
  dryRun?: boolean;
  force?: boolean;
  verbose?: boolean;
}

export interface BranchManagerOptions {
  filter?: FilterOptions;
  delete?: DeleteOptions;
}

export interface InteractiveChoice {
  name: string;
  value: string;
  checked?: boolean;
}

export interface DeleteResult {
  success: boolean;
  branchName: string;
  error?: string;
}

export interface BatchDeleteResult {
  total: number;
  success: number;
  failed: number;
  results: DeleteResult[];
}

export type FilterMode = 'keyword' | 'regex' | 'interactive';

export interface GitConfig {
  currentBranch: string;
  mainBranch: string;
  repositoryPath: string;
}
