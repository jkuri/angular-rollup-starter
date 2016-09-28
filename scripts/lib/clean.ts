import * as fs from 'fs-extra';
import * as path from 'path';
import { Observable } from 'rxjs';

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
