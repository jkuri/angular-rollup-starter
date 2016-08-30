const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const rollup = require('rollup');
const typescript = require('rollup-plugin-typescript');
const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const angular = require('rollup-plugin-angular');
const alias = require('rollup-plugin-alias');
const spawn = require('child_process').spawn;

const paths = {
  'rxjs': path.resolve(__dirname, '../../node_modules/rxjs-es'),
  '@angular/core': path.resolve(__dirname, '../../node_modules/@angular/core/esm/index'),
  '@angular/common': path.resolve(__dirname, '../../node_modules/@angular/common/esm/index'),
  '@angular/platform-browser-dynamic': path.resolve(__dirname, '../../node_modules/@angular/platform-browser-dynamic/esm/index')
};

class Build {
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
        this.buildVendor().then(vendorTime => {
          this.build().then(time => {
            this.log(`Initial build completed in ${vendorTime + time}ms. Ready for changes.`);
            this.onChange();
            resolve();
          });
        });
      });
    });
  }

  onChange() {
    this.watcher.on('change', (path, stats) => {
      this.log(`${path} changed. Rebuilding...`);
      this.build().then(time => {
        this.log(`Builded in ${time}ms.`);
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
          nodeResolve({ jsnext: true, main: true, browser: true }),
          babel({
            babelrc: false,
            presets: ['es2015-rollup'],
            exclude: '../../node_modules/**'
          }),
          alias(paths)
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
        })
        .then(resp => {
          let endTime = new Date();
          let timeDiff = endTime - startTime;
          resolve(timeDiff);
        });
      });
    });
  }

  buildVendor() {
    return new Promise(resolve => {
      let startTime = new Date();
      let roll = spawn('rollup', ['-c', 'config/rollup.vendor.config.js']);

      roll.on('close', (data) => {
        let tsc = spawn('tsc', [
          '--target',
          'es5',
          '--allowJs',
          'dist/vendor.es2015.js',
          '--out', 
          'dist/vendor.js'
        ]);

        tsc.on('close', code => {
          let endTime = new Date();
          let timeDiff = endTime - startTime;
          resolve(timeDiff);
        });
      });
    });
  }
}

module.exports = Build;
