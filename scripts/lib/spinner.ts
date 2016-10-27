import * as ora from 'ora';
import * as chalk from 'chalk';

let spinner;

export function start(msg = ''): void {
  if (spinner) { spinner.stop(); }
  spinner = ora({
    text: chalk.yellow(msg),
    color: 'yellow',
    spinner: 'growVertical',
    enabled: true,
    stream: process.stdout
  }).start();
}

export function stop(): void {
  spinner.stop();
}
