const browserSync = require('browser-sync');
const Watcher = require('./lib/watcher');
const fallback = require('connect-history-api-fallback');

class Server {
  constructor() {
    this.options = {
      port: 4200,
      server: './dist',
      files: ['./dist/**/*'],
      middleware: [
        fallback({
          index: '/index.html'
        })
      ]
    };
    this.watcher = new Watcher();
  }

  start() {
    this.watcher.init().then(resp => {
      browserSync(this.options);
      process.on('compileError', err => {
        err = JSON.parse(err);
        let msg = `Error: ${err.id}`;
        browserSync.notify(msg, 8000);
      });
    });
  }
}

const server = new Server();
server.start();
