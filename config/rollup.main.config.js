import path from 'path';
import alias from 'rollup-plugin-alias';
import resolve from 'rollup-plugin-node-resolve';
import angular from 'rollup-plugin-angular';
import ts from 'rollup-plugin-typescript';
import buble from 'rollup-plugin-buble';

export default {
  entry: 'src/main.ts',
  format: 'iife',
  dest: 'dist/main.js',
  sourceMap: true,
  plugins: [
    angular({
      exclude: 'node_modules/**'
    }),
    ts({
      typescript: require('../node_modules/typescript')
    }),
    alias({ 
      'rxjs': path.resolve(__dirname, '../node_modules/rxjs-es'),
      '@angular/core': path.resolve(__dirname, '../node_modules/@angular/core/esm/index'),
      '@angular/common': path.resolve(__dirname, '../node_modules/@angular/common/esm/index'),
      '@angular/platform-browser-dynamic': path.resolve(__dirname, '../node_modules/@angular/platform-browser-dynamic/esm/index')
    }),
    resolve({ jsnext: true, main: true, browser: true }),
    buble({
      exclude: 'node_modules/**'
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
  ],
  globals: {
    '@angular/core': 'vendor._angular_core',
    '@angular/common': 'vendor._angular_common',
    '@angular/platform-browser': 'vendor._angular_platformBrowser',
    '@angular/platform-browser-dynamic': 'vendor._angular_platformBrowserDynamic',
    '@angular/router': 'vendor._angular_router',
    '@angular/http': 'vendor._angular_http',
    '@angular/forms': 'vendor._angular_forms'
  }
}
