import * as path from 'path';
import * as browserSync from 'browser-sync';
import * as fallback from 'connect-history-api-fallback';
import * as chokidar from 'chokidar';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';
import { clean } from './clean';
import { generateDev } from './generate_html';
import { copyPublic } from './copy';
import { Build } from './build';
import { compileSass } from './css';
import { removeModuleIdFromComponents } from './helpers';

export class Server {
  private options: any;
  private builder: Build;

  constructor() {
    this.options = {
      port: 4200,
      server: path.resolve(__dirname, '../../dist'),
      files: ['./dist/**/*'],
      notify: false,
      middleware: [
        fallback({
          index: '/index.html'
        })
      ],
      logLevel: 'info',
      logPrefix: 'ng2',
      logConnections: false,
      logFileChanges: false,
      logSnippet: false
    };

    this.builder = new Build();
  }

  startServer() {
    browserSync(this.options);
  }

  get watch(): Observable<any> {
    return new Observable(observer => {
      const sassSrc = path.resolve(__dirname, '../../src/styles/app.sass');
      const cssDest = path.resolve(__dirname, '../../dist/css/app.css');

      const watcher = chokidar.watch(path.resolve(__dirname, '../../src'), {
        persistent: true
      });

      const publicWatcher = chokidar.watch(path.resolve(__dirname, '../../public'), {
        persistent: true
      });

      watcher.on('ready', () => {
        observer.next(chalk.green('-------------------------------------------------------'));

        clean('dist')
        .concat(removeModuleIdFromComponents())
        .concat(copyPublic())
        .concat(generateDev())
        .concat(compileSass(sassSrc, cssDest))
        .concat(this.builder.buildDev).subscribe(data => {
          observer.next(data);
        }, err => {
          console.log(err);
        }, () => {
          this.startServer();
          watcher.on('change', (file, stats) => {
            let ext: string = path.extname(file);
            let basename: string = path.basename(file);
            observer.next(chalk.blue(`${basename} changed...`));
            switch (ext) {
              case '.html':
                if (basename === 'index.html') {
                  generateDev().subscribe(data => console.log(data));
                } else {
                  this.builder.cache = null;
                  this.builder.buildDevMain.subscribe(data => { observer.next(data); });
                }
                break;
              case '.ts':
                this.builder.buildDevMain.subscribe(data => { observer.next(data); });
                break;
              case '.sass':
                compileSass(sassSrc, cssDest).subscribe(data => { observer.next(data); });
                break;
              default:
                break;
            }
          });

          publicWatcher.on('add', () => copyPublic().subscribe(data => console.log(data)));
          publicWatcher.on('change', () => copyPublic().subscribe(data => console.log(data)));
          publicWatcher.on('remove', () => copyPublic().subscribe(data => console.log(data)));
        });
      });
    });
  }
}