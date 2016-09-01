import * as fs from 'fs-extra';
import * as path from 'path';
import { Observable } from 'rxjs';

export function clean(): void {
  const dirPath: string = path.resolve(__dirname, '../../dist');
  return Observable.create(observer => {
    fs.remove(dirPath, (err) => {
      if (err) {
        observer.error(err);
      }

      observer.next(`${dirPath} deleted.`);
      observer.complete();
    });
  });
}
