import * as path from 'path';
import * as rollup from 'rollup';
import * as alias from 'rollup-plugin-alias';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as angular from 'rollup-plugin-angular';
import * as ts from 'rollup-plugin-typescript';
import * as buble from 'rollup-plugin-buble';
import * as uglify from 'rollup-plugin-uglify';
import { Observable } from 'rxjs';

class RollupNG2 {
  private options: any;

  constructor(options) {
    this.options = options;
  }

  resolveId(id, from): any {
    if (id.startsWith('rxjs/')) {
      return `${__dirname}/../../node_modules/rxjs-es/${id.replace('rxjs/', '')}.js`;
    }
  }
}

const rollupNG2 = (config) => new RollupNG2(config);

export class Build {
  public cache: any;
  private building: boolean;

  constructor() {
    this.building = false;
  }

  get buildAll(): Observable<any> {
    return Observable.merge(this.buildVendor, this.buildMain);
  }

  get buildMain(): Observable<any> {
    return Observable.create(observer => {
      let start: Date = new Date();
      this.mainBuilder.subscribe(bundle => {
        this.cache = bundle;
        Observable.fromPromise(bundle.write({
          format: 'iife',
          dest: path.resolve(__dirname, '../../dist/main.js'),
          sourceMap: true,
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          observer.next(`Build time (main): ${time}ms`);
          observer.complete();
        });
      }, err => {
        console.error(`Compile error: ${err}`);
        observer.complete();
      });
    });
  }

  get mainBuilder(): Observable<any> {
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
        alias({
          'rxjs': path.resolve(__dirname, '../../node_modules/rxjs-es')
        }),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble(),
        uglify()
      ]
    }));
  };

  get buildVendor(): Observable<any> {
    return Observable.create(observer => {
      let start: Date = new Date();
      this.vendorBuilder.subscribe(bundle => {
        this.cache = bundle;
        Observable.fromPromise(bundle.write({
          format: 'iife',
          dest: path.resolve(__dirname, '../../dist/vendor.js'),
          sourceMap: true,
          moduleName: 'vendor',
          useStrict: false
        })).subscribe(resp => {
          let time: number = new Date().getTime() - start.getTime();
          observer.next(`Build time (vendor): ${time}ms`);
          observer.complete();
        });
      }, err => {
        console.error(`Compile error: ${err}`);
        observer.complete();
      });
    });
  };

  get vendorBuilder(): Observable<any> {
    return Observable.fromPromise(rollup.rollup({
      entry: path.resolve(__dirname, '../../src/vendor.ts'),
      context: 'this',
      plugins: [
        rollupNG2(),
        angular({
          exclude: '../../node_modules/**'
        }),
        ts({
          typescript: require('../../node_modules/typescript')
        }),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble({
          exclude: '../../node_modules/**'
        })
      ]
    }));
  };
}
