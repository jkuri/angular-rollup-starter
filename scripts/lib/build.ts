import * as path from 'path';
import * as rollup from 'rollup';
import * as alias from 'rollup-plugin-alias';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as angular from 'rollup-plugin-angular';
import * as ts from 'rollup-plugin-typescript';
import * as buble from 'rollup-plugin-buble';
import { Observable } from 'rxjs';
import { spawn } from 'child_process';

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
      entry: path.resolve(__dirname, '../../src/main.ts'),
        cache: this.cache,
        plugins: [
          angular({
            exclude: '../../node_modules/**'
          }),
          ts({
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
    }));
  };

  get buildVendor(): Observable<any> {
    const config = path.resolve(__dirname, '../../config/rollup.vendor.config.js');

    return Observable.create(observer => {
      let start: Date = new Date();
      const ps = spawn('rollup', `-c ${config}`.split(/ /));
      ps.stdout.on('data', data => observer.next(data));
      ps.stderr.on('data', data => observer.next(data));
      ps.on('close', code => {
        let time: number = new Date().getTime() - start.getTime();
        console.log(`Build time (vendor): ${time}ms`);
        observer.complete(code);
      });
    });
  };
}
