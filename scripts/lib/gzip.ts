import * as path from 'path';
import * as fs from 'fs-extra';
import * as zlib from 'zlib';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';

export function app(): Observable<any> {
  return gzip('app.js', 'app.js.gz');
}

function gzip(srcFile: string, gzipFile: string): Observable<any> {
  const srcPath: string = path.resolve(__dirname, `../../dist/${srcFile}`);
  const srcMapPath: string = path.resolve(__dirname, `../../dist/${srcFile}.map`);
  const gzipDest: string = path.resolve(__dirname, `../../dist/${gzipFile}`);

  return new Observable(observer => {
    if (!fs.existsSync(srcPath)) {
      observer.error(`${srcPath} does not exists.`);
      observer.complete();
    } else {
      const srcStats: any = fs.statSync(srcPath);
      const srcCode = fs.readFileSync(srcPath);

      fs.outputFileSync(gzipDest, zlib.gzipSync(srcCode, { level: 9 }));

      const sourceMapStats: any = fs.statSync(srcMapPath);
      const gzipStats: any = fs.statSync(gzipDest);
      const sizes: any = {
        'src': formatBytes(srcStats.size, 2),
        'map': formatBytes(sourceMapStats.size, 2),
        'gzip': formatBytes(gzipStats.size, 2)
      };

      let output = chalk.green('-------------------------------------------------------\n');
      output += chalk.red(`${srcFile} (${sizes['src']})\n`);
      output += chalk.magenta(`${srcFile}.map (${sizes['map']})\n`);
      output += chalk.green(`${srcFile}.gz (${sizes['gzip']})`);
      output += chalk.green('\n-------------------------------------------------------');

      observer.next(output);
      observer.complete();
    }
  });
}

function formatBytes(bytes: number, decimals: number): string {
   if (bytes === 0) { return '0 Byte'; }
   const k = 1000;
   const dm: number = decimals + 1 || 3;
   const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   const i: number = Math.floor(Math.log(bytes) / Math.log(k));

   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

