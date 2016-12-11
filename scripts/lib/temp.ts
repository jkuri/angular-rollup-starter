import * as temp from 'temp';
import * as chalk from 'chalk';

export function setupTempDir(): Promise<string> {
  return new Promise(resolve => {
    temp.mkdir('', (err, dirPath) => {
      console.log(chalk.green(`Using ${chalk.yellow(dirPath)} as temporary directory.`));
      resolve(dirPath);
    });
  });
}
