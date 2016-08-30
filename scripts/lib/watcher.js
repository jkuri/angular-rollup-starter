const chokidar = require('chokidar');
const IndexHtml = require('./indexHtml');
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');

const rollup = require('rollup');
const alias = require('rollup-plugin-alias');
const nodeResolve = require('rollup-plugin-node-resolve');
const angular = require('rollup-plugin-angular');
const typescript = require('rollup-plugin-typescript');
const buble = require('rollup-plugin-buble');

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
        this.generateHtml()
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
      rollup.rollup({
        entry: path.resolve(__dirname, '../../src/main.ts'),
        plugins: [
          angular({
            exclude: '../../node_modules/**'
          }),
          typescript({
            typescript: require('../../node_modules/typescript')
          }),
          alias({ 
            'rxjs': path.resolve(__dirname, '../../node_modules/rxjs-es'),
            '@angular/core': path.resolve(__dirname, '../../node_modules/@angular/core/esm/index'),
            '@angular/common': path.resolve(__dirname, '../../node_modules/@angular/common/esm/index'),
            '@angular/platform-browser-dynamic': path.resolve(__dirname, '../../node_modules/@angular/platform-browser-dynamic/esm/index')
          }),
          nodeResolve({ jsnext: true, main: true, browser: true }),
          buble({
            exclude: '../../node_modules/**'
          })
        ],
        external: [
          '@angular/core',
          '@angular/common',
          '@angular/platform-browser-dynamic',
          '@angular/platform-browser',
          '@angular/forms',
          '@angular/http',
          '@angular/router',
        ]
      })
      .then(bundle => {
        bundle.write({
          format: 'iife',
          dest: path.resolve(__dirname, '../../dist/main.js'),
          sourceMap: true,
          globals: {
            '@angular/core': 'vendor._angular_core',
            '@angular/common': 'vendor._angular_common',
            '@angular/platform-browser': 'vendor._angular_platformBrowser',
            '@angular/platform-browser-dynamic': 'vendor._angular_platformBrowserDynamic',
            '@angular/router': 'vendor._angular_router',
            '@angular/http': 'vendor._angular_http',
            '@angular/forms': 'vendor._angular_forms'
          }
        }).then(resp => {
          let endTime = new Date();
          let timeDiff = endTime - startTime;
          resolve(timeDiff);
        });
      });
    });
  }

  buildVendor() {
    return new Promise(resolve => {
      let vendor = path.resolve(__dirname, '../../dist/vendor.js');
      try {
        fs.accessSync(vendor);
        resolve(0);
      } catch (e) {
        let startTime = new Date();
        let roll = spawn('npm', ['run', 'build:vendor']);

        roll.on('close', (data) => {
          let endTime = new Date();
          let timeDiff = endTime - startTime;
          resolve(timeDiff);
        });
      }
    });
  }
}

module.exports = Watcher;
