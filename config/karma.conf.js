'use strict';

const path = require('path');
const ts = require('rollup-plugin-typescript');
const buble = require('rollup-plugin-buble');
const nodeResolve = require('rollup-plugin-node-resolve');
const angular = require('rollup-plugin-angular');
const commonjs = require('rollup-plugin-commonjs');
const alias = require('rollup-plugin-alias');

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
          preprocessors: {
            style: src => {
              return sass.renderSync({ data: src, indentedSyntax: true, outputStyle: 'compressed' }).css;
            }
          }
        }),
        ts({
          typescript: require('../node_modules/typescript')
        }),
        alias({ 
          '@angular/core/testing': path.resolve(__dirname, '../node_modules/@angular/core/testing/index.js'),
          '@angular/platform-browser-dynamic/testing': path.resolve(__dirname, '../node_modules/@angular/platform-browser-dynamic/testing/index.js'),
          '@angular/compiler/testing': path.resolve(__dirname, '../node_modules/@angular/compiler/testing/index.js'),
          '@angular/platform-browser/testing': path.resolve(__dirname, '../node_modules/@angular/platform-browser/testing/index.js'),
          '@angular/router/testing': path.resolve(__dirname, '../node_modules/@angular/router/testing/index.js'),
          '@angular/common/testing': path.resolve(__dirname, '../node_modules/@angular/common/testing/index.js') 
        }),
        commonjs(),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble()
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeLauncher'],
    singleRun: true,
    customLaunchers: {
      ChromeLauncher: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  };

  config.set(configuration);
};
