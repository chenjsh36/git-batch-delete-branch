import chalk from 'chalk';

export class Logger {
  private static instance: Logger;
  private verbose: boolean = false;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(chalk.gray('🔍'), message);
    }
  }

  log(message: string): void {
    console.log(message);
  }

  table(data: any[]): void {
    console.table(data);
  }

  progress(message: string): void {
    process.stdout.write(chalk.cyan('⏳'), ' ', message);
  }

  clearProgress(): void {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
}

export const logger = Logger.getInstance();
