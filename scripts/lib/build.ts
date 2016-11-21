import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';
import * as ts from 'typescript';
import * as tsc from '@angular/tsc-wrapped';
import { CodeGenerator } from '@angular/compiler-cli';
import * as spinner from './spinner';
import { timeHuman } from './helpers';
import { getConfig } from './config';
import * as sass from 'node-sass';
import * as cleanCss from 'clean-css';
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const angular = require('rollup-plugin-angular');
const tsr = require('rollup-plugin-typescript');
const buble = require('rollup-plugin-buble');
const uglify = require('rollup-plugin-uglify');
const serve = require('rollup-plugin-serve');
const livereload = require('../plugins/rollup-plugin-livereload');

export class Build {
  public cache: any;
  public building: boolean;
  public config: any;

  constructor() {
    this.building = false;
    this.config = getConfig();
  }

  get buildDev(): Observable<any> {
    return this.buildDevMain.concat(this.buildDevVendor);
  }

  get buildDevMain(): Observable<any> {
    return Observable.create(observer => {
      let start: Date = new Date();
      spinner.start('Building...');
      this.devMainBuilder.subscribe(bundle => {
        this.cache = bundle;
        Observable.fromPromise(bundle.write({
          format: 'iife',
          dest: path.resolve(__dirname, '../../dist/main.js'),
          sourceMap: false,
          globals: Object.assign({
            '@angular/core': 'vendor._angular_core',
            '@angular/common': 'vendor._angular_common',
            '@angular/platform-browser': 'vendor._angular_platformBrowser',
            '@angular/platform-browser-dynamic': 'vendor._angular_platformBrowserDynamic',
            '@angular/router': 'vendor._angular_router',
            '@angular/http': 'vendor._angular_http',
            '@angular/forms': 'vendor._angular_forms'
          }, this.config.externalPackages)
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          spinner.stop();
          observer.next(`${chalk.green('✔')} ${chalk.yellow(`Build Time (main): ${timeHuman(time)}`)}`);
          observer.complete();
        });
      }, err => {
        this.cache = null;
        observer.next(chalk.red(`✖ Compile error: ${err}`));
        spinner.stop();
        observer.complete();
      });
    });
  }

  get devMainBuilder(): Observable<any> {
    return Observable.fromPromise(rollup.rollup({
      entry: path.resolve(__dirname, '../../src/main.ts'),
      cache: this.cache,
      context: 'this',
      plugins: [
        angular({
          preprocessors: {
            style: src => {
              return sass.renderSync({ data: src, indentedSyntax: true, outputStyle: 'compressed' }).css;
            }
          }
        }),
        tsr({
          typescript: require('../../node_modules/typescript')
        }),
        commonjs(),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble()
      ],
      external: [
        '@angular/core',
        '@angular/common',
        '@angular/platform-browser-dynamic',
        '@angular/platform-browser',
        '@angular/forms',
        '@angular/http',
        '@angular/router'
      ].concat(Object.keys(this.config.externalPackages))
    }));
  };

  get buildDevVendor(): Observable<any> {
    return Observable.create(observer => {
      let start: Date = new Date();
      spinner.start('Building...');
      this.devVendorBuilder.subscribe(bundle => {
        this.cache = bundle;
        Observable.fromPromise(bundle.write({
          format: 'iife',
          moduleName: 'vendor',
          dest: path.resolve(__dirname, '../../dist/vendor.js')
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          spinner.stop();
          observer.next(`${chalk.green('✔')} ${chalk.yellow(`Build Time (vendor): ${timeHuman(time)}`)}`);
          observer.complete();
        });
      }, err => {
        observer.next(chalk.red(`✖ Compile error: ${err}`));
        spinner.stop();
        observer.complete();
      });
    });
  }

  get devVendorBuilder(): Observable<any> {
    return Observable.fromPromise(rollup.rollup({
      entry: path.resolve(__dirname, '../../src/vendor.ts'),
      context: 'this',
      plugins: [
        angular({
          preprocessors: {
            style: src => {
              return sass.renderSync({ data: src, indentedSyntax: true, outputStyle: 'compressed' }).css;
            }
          }
        }),
        tsr({
          typescript: require('../../node_modules/typescript')
        }),
        commonjs(),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble(),
        serve({
          contentBase: 'dist/',
          historyApiFallback: true,
          port: 4200
        }),
        livereload({
          watch: 'dist/',
          consoleLogMsg: false
        })
      ]
    }));
  };

  get buildProd(): Observable<any> {
    return this.ngc('tsconfig.aot.json').concat(this.runBuildProd);
  }

  get runBuildProd(): Observable<any> {
    return Observable.create(observer => {
      let start: Date = new Date();
      spinner.start('Building...');
      this.prodBuilder.subscribe(bundle => {
        Observable.fromPromise(bundle.write({
          format: 'iife',
          dest: path.resolve(__dirname, '../../dist/app.js'),
          sourceMap: true,
          moduleName: 'app'
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          spinner.stop();
          observer.next(`${chalk.green('✔')} ${chalk.yellow(`Build time: ${timeHuman(time)}`)}`);
          observer.complete();
        });
      }, err => {
        observer.next(chalk.red(`✖ Compile error: ${err}`));
        spinner.stop();
        observer.complete();
      });
    });
  }

  get prodBuilder(): Observable<any> {
    return Observable.fromPromise(rollup.rollup({
      entry: path.resolve(__dirname, '../../src/main.aot.ts'),
      context: 'this',
      plugins: [
        angular({
          preprocessors: {
            style: src => {
              return sass.renderSync({ data: src, indentedSyntax: true, outputStyle: 'compressed' }).css;
            }
          }
        }),
        tsr({
          typescript: require('../../node_modules/typescript')
        }),
        commonjs(),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble(),
        uglify()
      ]
    }));
  };

  private codegen(ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.NgcCliOptions, program: ts.Program, host: ts.CompilerHost) {
    return CodeGenerator.create(ngOptions, cliOptions, program, host).codegen({
      transitiveModules: true
    });
  }

  private ngc(config: string): Observable<any> {
    return Observable.create(observer => {
      let start: Date = new Date();
      const cliOptions = new tsc.NgcCliOptions({});
      spinner.start('Building...');
      tsc.main(path.resolve(__dirname, `../../${config}`), cliOptions, this.codegen)
      .then(() => {
        let time: number = new Date().getTime() - start.getTime();
        spinner.stop();
        observer.next(`${chalk.green('✔')} ${chalk.yellow(`AoT Build Time: ${timeHuman(time)}`)}`);
        observer.complete();
      });
    });
  }
}
