import * as path from 'path';
import * as chokidar from 'chokidar';
import * as chalk from 'chalk';
import { Observable, Subscription } from 'rxjs';
import { generateDevHtml } from './generate_html';
import { copyPublic } from './utils';
import { Build } from './build';
import { compileSass } from './css';
import { removeModuleIdFromComponents } from './helpers';
import { getPort, getLivereloadPort, printLine } from './utils';
const open = require('open');

export class Server {
  port: number;
  private builder: Build;

  constructor() {
    this.builder = new Build();
  }

  watch(tempDir: string): Observable<any> {
    return new Observable(observer => {
      const sassSrc = path.resolve(__dirname, '../../src/styles/app.sass');
      const cssDest = path.resolve(tempDir, 'css/app.css');
      let building: Subscription = null;
      let port;
      let lrport;

      const watcher = chokidar.watch(path.resolve(__dirname, '../../src'), {
        persistent: true
      });

      const publicWatcher = chokidar.watch(path.resolve(__dirname, '../../public'), {
        persistent: true
      });

      watcher.on('ready', () => {
        printLine();

        removeModuleIdFromComponents()
          .then(() => getPort())
          .then(p => port = p)
          .then(() => getLivereloadPort())
          .then(lrp => lrport = lrp)
          .then(() => {
            copyPublic(tempDir)
            .concat(generateDevHtml(tempDir))
            .concat(compileSass(sassSrc, cssDest))
            .concat(this.builder.buildDev(tempDir, port, lrport)).subscribe(data => {
              observer.next(data);
            }, err => {
              console.log(chalk.red(err));
            }, () => {
              open(`http://localhost:${port}`);
              watcher.on('change', (file, stats) => {
                let ext: string = path.extname(file);
                let basename: string = path.basename(file);
                observer.next(chalk.blue(`${basename} changed...`));
                switch (ext) {
                  case '.html':
                    if (basename === 'index.html') {
                      generateDevHtml(tempDir).subscribe(data => observer.next(data));
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
    });
  }
}
