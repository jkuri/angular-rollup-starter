import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';

export function copyPublic(): Observable<any> {
  const publicDir: string = path.resolve(__dirname, '../../public');
  const destDir: string = path.resolve(__dirname, '../../dist');

  return new Observable(observer => {
    fs.copy(publicDir, destDir, (err) => {
      if (err) {
        observer.error(err);
      }
      observer.complete();
    });
  });
}
