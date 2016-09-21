'use strict';

const Mocha = require('mocha');
const glob = require('glob');
const path = require('path');

const root = path.resolve(__dirname, './acceptance');
const mocha = new Mocha({ timeout: 5000, reporter: 'spec' });

glob.sync(root + '/**/*.spec.js').forEach(specFile => {
  mocha.addFile(specFile);
});

mocha.run(failures => {
  process.on('exit', process.exit(failures));
});
