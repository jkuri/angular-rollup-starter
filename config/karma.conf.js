'use strict';

const path = require('path');
const ts = require('rollup-plugin-typescript');
const buble = require('rollup-plugin-buble');
const nodeResolve = require('rollup-plugin-node-resolve');
const angular = require('rollup-plugin-angular');
const commonjs = require('rollup-plugin-commonjs');
const alias = require('rollup-plugin-alias');
const progress = require('rollup-plugin-progress');


module.exports = (config) => {
  const configuration = {
    basePath: '../',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-rollup-plugin'),
      require('karma-spec-reporter'),
      require('./karma-sass-preprocessor'),
    ],
    reporters: ['spec'],
    specReporter: {
      maxLogLines: 5,
      suppressErrorSummary: false,
      suppressFailed: false,
      suppressPassed: false,
      suppressSkipped: true,
      showSpecTiming: true
    },
    files: [
      { pattern: 'public/**/*', watched: false, included: false, served: true },
      'src/styles/app.sass',
      'src/test.ts'
    ],
    proxies: {
      '/images/': '/base/public/images/',
      '/fonts/': '/base/public/fonts/',
      '/i18n/': '/base/public/i18n/'
    },
    preprocessors: {
      'src/test.ts': ['rollup'],
      'src/styles/app.sass': ['sass']
    },
    rollupPreprocessor: {
      context: 'this',
      format: 'iife',
      plugins: [
        angular(),
        ts({
          typescript: require('../node_modules/typescript')
        }),
        alias({
          '@angular/core/testing': path.resolve(__dirname, '../node_modules/@angular/core/testing/index.js'),
          '@angular/platform-browser-dynamic/testing': path.resolve(__dirname, '../node_modules/@angular/platform-browser-dynamic/testing/index.js'),
          '@angular/compiler/testing': path.resolve(__dirname, '../node_modules/@angular/compiler/testing/index.js'),
          '@angular/platform-browser/testing': path.resolve(__dirname, '../node_modules/@angular/platform-browser/testing/index.js'),
          '@angular/router/testing': path.resolve(__dirname, '../node_modules/@angular/router/testing/index.js'),
          '@angular/common/testing': path.resolve(__dirname, '../node_modules/@angular/common/testing/index.js'),
        }),
        commonjs(),
        nodeResolve({ jsnext: true, main: true, browser: true }),
        buble(),
        progress()
      ]
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: 1,
    browserNoActivityTimeout: 10000,
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    }
  };

  config.set(configuration);
};
