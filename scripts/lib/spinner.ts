import { Spinner } from 'cli-spinner';
import * as chalk from 'chalk';

let spinner;

export function start(msg: string = ''): void {
  if (spinner) { spinner.stop(); }
  spinner = new Spinner(chalk.yellow(`${msg} %s`));
  spinner.start();
}

export function stop(): void {
  spinner.stop(true);
}
