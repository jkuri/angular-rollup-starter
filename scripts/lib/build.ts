import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as chalk from 'chalk';
import * as rollup from 'rollup';
import * as commonjs from 'rollup-plugin-commonjs';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as angular from 'rollup-plugin-angular';
import * as tsr from 'rollup-plugin-typescript';
import * as buble from 'rollup-plugin-buble';
import * as uglify from 'rollup-plugin-uglify';
import { Observable } from 'rxjs';
import * as ts from 'typescript';
import * as tsc from '@angular/tsc-wrapped';
import { CodeGenerator } from '@angular/compiler-cli';
import * as spinner from './spinner';

export class Build {
  public cache: any;
  public building: boolean;

  constructor() {
    this.building = false;
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
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          spinner.stop();
          observer.next(chalk.green(`Build time (main): ${time}ms`));
          observer.complete();
        });
      }, err => {
        console.error(`Compile error: ${err}`);
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
          exclude: '../../node_modules/**'
        }),
        tsr({
          typescript: require('../../node_modules/typescript')
        }),
        commonjs({
          include: 'node_modules/rxjs/**'
        }),
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
        '@angular/router',
      ]
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
          observer.next(chalk.green(`Build time (vendor): ${time}ms`));
          observer.complete();
        });
      }, err => {
        console.error(`Compile error: ${err}`);
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
          exclude: '../../node_modules/**'
        }),
        tsr({
          typescript: require('../../node_modules/typescript')
        }),
        commonjs({
          include: 'node_modules/rxjs/**'
        }),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble()
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
        this.cache = bundle;
        Observable.fromPromise(bundle.write({
          format: 'iife',
          dest: path.resolve(__dirname, '../../dist/app.js'),
          sourceMap: true,
          moduleName: 'app'
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          spinner.stop();
          observer.next(chalk.green(`Build Time: ${time}ms`));
          observer.complete();
        });
      }, err => {
        console.error(`Compile error: ${err}`);
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
          exclude: '../../node_modules/**'
        }),
        tsr({
          typescript: require('../../node_modules/typescript')
        }),
        commonjs({
          include: 'node_modules/rxjs/**'
        }),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble({
          exclude: '../../node_modules/**'
        }),
        uglify()
      ]
    }));
  };

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
        observer.next(chalk.green(`AoT Build Time: ${time}ms`));
        observer.complete();
      });
    });
  }
}
