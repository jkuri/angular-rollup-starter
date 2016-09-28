import * as fs from 'fs-extra';
import * as path from 'path';
import * as _ from 'lodash';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';

const index = path.resolve(__dirname, '../../src/index.html');
const dest = path.resolve(__dirname, '../../dist/index.html');
const content = _.template(fs.readFileSync(index).toString());

export function generateDev(): Observable<any> {
  return new Observable(observer => {
    const styles = ['css/app.css'];
    const scripts = ['vendor.js', 'main.js'];
    fs.outputFile(dest, content({ styles: styles, scripts: scripts }), err => {
      if (err) {
        observer.error(err);
      }

      observer.next(chalk.green(`index.html generated at ${dest}`));
      observer.complete();
    });
  });
};
export function generateProd(): Observable<any> {
  return new Observable(observer => {
    const styles = ['css/app.css'];
    const scripts = ['app.js'];
    fs.outputFile(dest, content({ styles: styles, scripts: scripts }), err => {
      if (err) {
        observer.error(err);
      }

      observer.next(chalk.green(`index.html generated at ${dest}`));
      observer.complete();
    });
  });
};
