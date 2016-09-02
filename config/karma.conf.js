'use strict';

const path = require('path');
const ts = require('rollup-plugin-typescript');
const buble = require('rollup-plugin-buble');
const nodeResolve = require('rollup-plugin-node-resolve');
const alias = require('rollup-plugin-alias');
const angular = require('rollup-plugin-angular');

module.exports = (config) => {
  const configuration = {
    basePath: '../',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-rollup-plugin')
    ],
    files: [
      'src/test.ts',
    ],
    reporters: ['progress'],
    preprocessors: {
     'src/test.ts': ['rollup']
    },
    rollupPreprocessor: {
      context: 'this',
      plugins: [
        angular({
          exclude: 'node_modules/**'
        }),
        ts({
          typescript: require('../node_modules/typescript')
        }),
        alias({ 
          'rxjs': path.resolve(__dirname, '../node_modules/rxjs-es'),
          '@angular/core/testing': path.resolve(__dirname, '../node_modules/@angular/core/testing/index'),
          '@angular/platform-browser-dynamic/testing': path.resolve(__dirname, '../node_modules/@angular/platform-browser-dynamic/testing/index'),
          '@angular/compiler/testing': path.resolve(__dirname, '../node_modules/@angular/compiler/testing/index'),
          '@angular/platform-browser/testing': path.resolve(__dirname, '../node_modules/@angular/platform-browser/testing/index')
        }),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble({
          transforms: { dangerousForOf: true }
        })
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: true
  };

  config.set(configuration);
};
