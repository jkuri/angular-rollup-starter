import * as path from 'path';
import * as chokidar from 'chokidar';
import * as chalk from 'chalk';
import { Observable, Subscription } from 'rxjs';
import { clean } from './clean';
import { generateDev } from './generate_html';
import { copyPublic } from './copy';
import { Build } from './build';
import { compileSass } from './css';
import { removeModuleIdFromComponents } from './helpers';
const open = require('open');

export class Server {
  private builder: Build;

  constructor() {
    this.builder = new Build();
  }

  watch(tempDir: string): Observable<any> {
    return new Observable(observer => {
      const sassSrc = path.resolve(__dirname, '../../src/styles/app.sass');
      const cssDest = path.resolve(tempDir, 'css/app.css');
      let building: Subscription = null;

      const watcher = chokidar.watch(path.resolve(__dirname, '../../src'), {
        persistent: true
      });

      const publicWatcher = chokidar.watch(path.resolve(__dirname, '../../public'), {
        persistent: true
      });

      watcher.on('ready', () => {
        observer.next(chalk.green('-------------------------------------------------------'));

        removeModuleIdFromComponents()
        .concat(copyPublic(tempDir))
        .concat(generateDev(tempDir))
        .concat(compileSass(sassSrc, cssDest))
        .concat(this.builder.buildDev(tempDir)).subscribe(data => {
          observer.next(data);
        }, err => {
          console.log(chalk.red(err));
        }, () => {
          open('http://localhost:4200');
          watcher.on('change', (file, stats) => {
            let ext: string = path.extname(file);
            let basename: string = path.basename(file);
            observer.next(chalk.blue(`${basename} changed...`));
            switch (ext) {
              case '.html':
                if (basename === 'index.html') {
                  generateDev(tempDir).subscribe(data => observer.next(data));
                } else {
                  this.builder.cache = null;
                  if (this.builder.building) {
                    building.unsubscribe();
                    building = this.builder.buildDevMain(tempDir).subscribe(data => observer.next(data));
                  } else {
                    building = this.builder.buildDevMain(tempDir).subscribe(data => observer.next(data));
                  }
                }
                break;
              case '.ts':
                if (this.builder.building) {
                  building.unsubscribe();
                  building = this.builder.buildDevMain(tempDir).subscribe(data => observer.next(data));
                } else {
                  building = this.builder.buildDevMain(tempDir).subscribe(data => observer.next(data));
                }
                break;
              case '.sass':
                compileSass(sassSrc, cssDest).subscribe(data => { observer.next(data); });
                break;
              default:
                break;
            }
          });

          publicWatcher.on('add', () => copyPublic(tempDir).subscribe(data => console.log(data)));
          publicWatcher.on('change', () => copyPublic(tempDir).subscribe(data => console.log(data)));
          publicWatcher.on('remove', () => copyPublic(tempDir).subscribe(data => console.log(data)));
        });
      });
    });
  }
}
