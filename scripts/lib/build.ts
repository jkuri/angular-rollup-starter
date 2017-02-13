import 'reflect-metadata';
import * as path from 'path';
import * as sass from 'node-sass';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import { Observable } from 'rxjs';
import * as ts from 'typescript';
import * as tsc from '@angular/tsc-wrapped';
import { CodeGenerator } from '@angular/compiler-cli';
import * as spinner from './spinner';
import { timeHuman } from './helpers';
import { getConfig } from './utils';
import * as uglify from 'uglify-js';
import { livereload } from '../plugins/rollup-plugin-livereload';
const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const angular = require('rollup-plugin-angular');
const tsr = require('rollup-plugin-typescript');
const serve = require('rollup-plugin-serve');
const progress = require('rollup-plugin-progress');

export class Build {
  public cache: any;
  public building: boolean;
  public config: any;

  constructor() {
    this.building = false;
    this.config = getConfig();
  }

  buildDev(tempDir: string, port: number): Observable<any> {
    return this.buildDevMain(tempDir).concat(this.buildDevVendor(tempDir, port));
  }

  buildDevMain(tempDir: string): Observable<any> {
    this.building = true;
    return Observable.create(observer => {
      let start: Date = new Date();
      this.devMainBuilder(tempDir).subscribe(bundle => {
        this.cache = bundle;
        Observable.fromPromise(bundle.write({
          format: 'iife',
          dest: path.resolve(tempDir, 'main.js'),
          sourceMap: true,
          globals: this.config.externalPackages
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          observer.next(`${chalk.green('✔')} Build Time (main): ${timeHuman(time)}`);
          this.building = false;
          observer.complete();
        });
      }, err => {
        this.cache = null;
        observer.next(chalk.red(`✖ Compile error: ${err}`));
        this.building = false;
        observer.complete();
      });
    });
  }

  devMainBuilder(tempDir: string): Observable<any> {
    return Observable.fromPromise(rollup.rollup({
      entry: path.resolve(__dirname, '../../src/main.ts'),
      cache: this.cache,
      context: 'this',
      plugins: [
        angular({
          preprocessors: {
            style: (scss: string, path: string) => {
              return sass.renderSync({ file: path, outputStyle: 'compressed' }).css;
            }
          }
        }),
        tsr({
          typescript: require('../../node_modules/typescript')
        }),
        commonjs(),
        nodeResolve(),
        progress()
      ],
      external: Object.keys(this.config.externalPackages)
    }));
  };

  buildDevVendor(tempDir: string, port: number): Observable<any> {
    return Observable.create(observer => {
      let start: Date = new Date();
      this.devVendorBuilder(tempDir, port).subscribe(bundle => {
        this.cache = bundle;
        Observable.fromPromise(bundle.write({
          format: 'iife',
          moduleName: 'vendor',
          sourceMap: true,
          dest: path.resolve(tempDir, 'vendor.js')
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          observer.next(`${chalk.green('✔')} Build Time (vendor): ${timeHuman(time)}`);
          observer.complete();
        });
      }, err => {
        observer.next(chalk.red(`✖ Compile error: ${err}`));
        observer.complete();
      });
    });
  }

  devVendorBuilder(tempDir: string, port: number): Observable<any> {
    return Observable.fromPromise(rollup.rollup({
      entry: path.resolve(__dirname, '../../src/vendor.ts'),
      context: 'this',
      plugins: [
        angular({
          preprocessors: {
            style: (scss: string, path: string) => {
              return sass.renderSync({ file: path, outputStyle: 'compressed' }).css;
            }
          }
        }),
        tsr({
          typescript: require('../../node_modules/typescript')
        }),
        commonjs(),
        nodeResolve(),
        progress(),
        serve({
          contentBase: path.resolve(tempDir),
          historyApiFallback: true,
          port: port
        }),
        livereload({
          watch: path.resolve(tempDir),
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
      this.prodBuilder.subscribe(bundle => {
        Observable.fromPromise(bundle.write({
          format: 'iife',
          dest: path.resolve(__dirname, '../../dist/app.js'),
          sourceMap: false,
          moduleName: 'app'
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          observer.next(`${chalk.green('✔')} Build time: ${timeHuman(time)}`);
          observer.complete();
        });
      }, err => {
        observer.next(chalk.red(`✖ Compile error: ${err}`));
        observer.complete();
      });
    });
  }

  get prodBuilder(): Observable<any> {
    return Observable.fromPromise(rollup.rollup({
      entry: path.resolve(__dirname, '../../aot/src/main.aot.js'),
      context: 'this',
      plugins: [
        angular({
          preprocessors: {
            style: (scss: string, path: string) => {
              return sass.renderSync({ file: path, outputStyle: 'compressed' }).css;
            }
          }
        }),
        commonjs(),
        nodeResolve(),
        progress()
      ]
    }));
  };

  get minifyBundle(): Observable<any> {
    return Observable.create(observer => {
      let start: Date = new Date();
      spinner.start('Optimizing...');
      let file = path.resolve(__dirname, '../../dist/app.js');
      fs.writeFile(file, uglify.minify(file).code, (err: NodeJS.ErrnoException) => {
        spinner.stop();
        if (err) {
          observer.error(err);
        }

        let time: number = new Date().getTime() - start.getTime();
        observer.next(`${chalk.green('✔')} Optimizing time: ${timeHuman(time)}`);
        observer.complete();
      });
    });
  }

  private codegen(ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.NgcCliOptions, program: ts.Program, host: ts.CompilerHost) {
    return CodeGenerator.create(ngOptions, cliOptions, program, host).codegen();
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
        observer.next(`${chalk.green('✔')} AoT Build Time: ${timeHuman(time)}`);
        observer.complete();
      })
      .catch(err => {
        observer.next(chalk.red(`✖ Compile error: ${err}`));
        observer.error();
      });
    });
  }
}
