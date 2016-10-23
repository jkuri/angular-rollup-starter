import * as path from 'path';
import * as fs from 'fs-extra';
import * as sass from 'node-sass';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';

export function compileSass(srcPath: string, destPath: string): Observable<any> {
  return new Observable(observer => {
    if (!fs.existsSync(srcPath)) {
      observer.complete();
      return;
    }

    let start: Date = new Date();
    sass.render({ file: srcPath, outputStyle: 'compressed' }, (err, result) => {
      if (err) {
        observer.next(err);
        observer.complete();
        return;
      }

      fs.outputFile(destPath, result.css, writeErr => {
        if (writeErr) {
          observer.next(err);
          observer.complete();
          return;
        }

        let time: number = new Date().getTime() - start.getTime();
        observer.next(`${chalk.green('✔')} ${chalk.yellow(`SaaS Build Time: ${time}ms`)}`);
        observer.complete();
      });
    });
  });
}
