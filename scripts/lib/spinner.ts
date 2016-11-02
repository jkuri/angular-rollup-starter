import * as clispinner from 'cli-progress-spinner';
import * as chalk from 'chalk';

let spinner;

export function start(msg = ''): void {
  if (spinner) { spinner.stop(); }
  spinner = clispinner({
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
