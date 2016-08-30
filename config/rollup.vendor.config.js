import path from 'path';
import alias from 'rollup-plugin-alias';
import resolve from 'rollup-plugin-node-resolve';
import angular from 'rollup-plugin-angular';
import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/vendor.ts',
  format: 'iife',
  dest: 'dist/vendor.es2015.js',
  sourceMap: true,
  moduleName: 'vendor',
  plugins: [
    angular({
      exclude: 'node_modules/**'
    }),
    typescript({
      typescript: require('../node_modules/typescript')
    }),
    alias({ 
      'rxjs': path.resolve(__dirname, '../node_modules/rxjs-es'),
      '@angular/core': path.resolve(__dirname, '../node_modules/@angular/core/esm/index'),
      '@angular/common': path.resolve(__dirname, '../node_modules/@angular/common/esm/index'),
      '@angular/platform-browser-dynamic': path.resolve(__dirname, '../node_modules/@angular/platform-browser-dynamic/esm/index')
    }),
    resolve({ jsnext: true, main: true, browser: true }),
    babel({
      babelrc: false,
      presets: ['es2015-rollup'],
      exclude: 'node_modules/**'
    })
  ]
}
