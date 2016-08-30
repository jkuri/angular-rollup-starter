const browserSync = require('browser-sync');
const Watcher = require('./lib/watcher');

class Server {
  constructor() {
    this.options = {
      port: 4200,
      server: './dist',
      files: ['./dist/**/*']
    };
    this.watcher = new Watcher();
  }

  start() {
    this.watcher.init().then(resp => {
      browserSync(this.options);
    });
  }
}

const server = new Server();
server.start();
