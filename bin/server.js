const browserSync = require('browser-sync');
const Build = require('./lib/build');

class Server {
  constructor() {
    this.options = {
      port: 4200,
      server: './dist',
      files: ['./dist/**/*']
    };
    this.builder = new Build();
  }

  start() {
    this.builder.init().then(resp => {
      browserSync(this.options);
    });
  }
}

const server = new Server();
server.start();
