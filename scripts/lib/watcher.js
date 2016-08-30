const chokidar = require('chokidar');
const IndexHtml = require('./indexHtml');
const spawn = require('child_process').spawn;

const indexHtml = new IndexHtml();

class Watcher {
  constructor() {
    this.watcher = chokidar.watch('./src', {
      ignored: /[\/\\]\./,
      persistent: true
    });
    this.log = console.log.bind(console);
  }

  init() {
    return new Promise(resolve => {
      this.watcher.on('ready', () => {
        this.log(`Starting initial build...`);
        this.clean()
        .then(() => this.generateHtml())
        .then(() => {
          this.buildVendor()
          .then(vendorTime => {
            this.build()
            .then(time => {
              this.log(`Initial build completed in ${vendorTime + time}ms. Ready for changes.`);
              this.onChange();
              resolve();
            });
          });
        });
      });
    });
  }

  onChange() {
    this.watcher.on('change', (path, stats) => {
      this.log(`${path} changed. Rebuilding...`);
      this.build().then(time => {
        this.log(`Built in ${time}ms.`);
      });
    });
  }

  clean() {
    return new Promise(resolve => {
      let clean = spawn('npm', ['run', 'clean']);
      clean.on('close', () => {
        resolve();
      });
    });
  }

  generateHtml() {
    return new Promise(resolve => {
      let generate = spawn('npm', ['run', 'index:dev']);
      generate.on('close', () => {
        resolve();
      });
    });
  }

  build() {
    return new Promise(resolve => {
      let startTime = new Date();
      let roll = spawn('npm', ['run', 'build:main']);

      roll.on('close', (data) => {
        let endTime = new Date();
        let timeDiff = endTime - startTime;
        resolve(timeDiff);
      });
    });
  }

  buildVendor() {
    return new Promise(resolve => {
      let startTime = new Date();
      let roll = spawn('npm', ['run', 'build:vendor']);

      roll.on('close', (data) => {
        let endTime = new Date();
        let timeDiff = endTime - startTime;
        resolve(timeDiff);
      });
    });
  }
}

module.exports = Watcher;
