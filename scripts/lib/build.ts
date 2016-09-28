import * as path from 'path';
import * as rollup from 'rollup';
import * as commonjs from 'rollup-plugin-commonjs';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as angular from 'rollup-plugin-angular';
import * as ts from 'rollup-plugin-typescript';
import * as buble from 'rollup-plugin-buble';
import * as uglify from 'rollup-plugin-uglify';
import { Observable } from 'rxjs';

export class Build {
  public cache: any;
  public building: boolean;

  constructor() {
    this.building = false;
  }

  get buildDev(): Observable<any> {
    return Observable.create(observer => {
      let start: Date = new Date();
      this.devBuilder.subscribe(bundle => {
        this.cache = bundle;
        Observable.fromPromise(bundle.write({
          format: 'iife',
          dest: path.resolve(__dirname, '../../dist/app.js'),
          sourceMap: true,
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          observer.next(`Build time: ${time}ms`);
          observer.complete();
        });
      }, err => {
        console.error(`Compile error: ${err}`);
        observer.complete();
      });
    });
  }

  get devBuilder(): Observable<any> {
    return Observable.fromPromise(rollup.rollup({
      entry: path.resolve(__dirname, '../../src/main.aot.ts'),
      cache: this.cache,
      context: 'this',
      plugins: [
        angular({
          exclude: '../../node_modules/**'
        }),
        ts({
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
    return Observable.create(observer => {
      let start: Date = new Date();
      this.prodBuilder.subscribe(bundle => {
        this.cache = bundle;
        Observable.fromPromise(bundle.write({
          format: 'iife',
          dest: path.resolve(__dirname, '../../dist/app.js'),
          sourceMap: true,
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          observer.next(`Build time: ${time}ms`);
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
      cache: this.cache,
      context: 'this',
      plugins: [
        angular({
          exclude: '../../node_modules/**'
        }),
        ts({
          typescript: require('../../node_modules/typescript')
        }),
        commonjs({
          include: 'node_modules/rxjs/**'
        }),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble(),
        uglify()
      ]
    }));
  };
}
