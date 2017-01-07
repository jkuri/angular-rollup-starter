import * as fs from 'fs-extra';
import * as path from 'path';
import * as temp from 'temp';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';
const portfinder = require('portfinder');

export function getConfig(): any {
  return fs.readJsonSync(path.resolve(__dirname, '../../config.json'));
}

export function getPackageJson(): any {
  return fs.readJsonSync(path.resolve(__dirname, '../../package.json'));
}

export function getPort(): Promise<number> {
  return new Promise((resolve, reject) => {
    portfinder.getPort((err, port) => {
      if (err) {
        reject(err);
      }

      resolve(port);
    });
  });
}

export function clean(dir: string): Observable<any> {
  const dirPath: string = path.resolve(__dirname, `../../${dir}`);
  return Observable.create(observer => {
    fs.remove(dirPath, (err) => {
      if (err) {
        observer.error(err);
      }
      observer.complete();
    });
  });
}

export function copyPublic(dir: string): Observable<any> {
  const publicDir: string = path.resolve(__dirname, '../../public');
  const destDir: string = path.resolve(dir);

  return new Observable(observer => {
    fs.copy(publicDir, destDir, (err) => {
      if (err) {
        observer.error(err);
      }
      observer.complete();
    });
  });
}

export function setupTempDir(): Promise<string> {
  return new Promise(resolve => {
    temp.mkdir('', (err, dirPath) => {
      console.log(`${chalk.magenta('Dir')} ${chalk.yellow(dirPath)}`);
      resolve(dirPath);
    });
  });
}

export function printLine() {
  console.log(chalk.blue('-------------------------------------------------------------------------------------------'));
}
