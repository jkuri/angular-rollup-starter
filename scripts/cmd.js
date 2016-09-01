'use strict';

const fs = require('fs');
const ts = require('typescript');

require.extensions['.ts'] = function(m, filename) {
  const source = fs.readFileSync(filename).toString();

  try {
    const result = ts.transpile(source, {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJs
    });

    return m._compile(result, filename);
  } catch (err) {
    throw err;
  }
};

const build = require('./lib/build');
const clean = require('./lib/clean');

const args = process.argv.slice(2);

if (args[0] === 'build' || args[0] === 'b') {
  const cmd = new build.Build();

  switch (args[1]) {
    case 'main': {
      cmd.buildMain.subscribe(data => {
        console.info(data);
      }, err => {
        throw new Error(err);
      }, () => {
        console.log('Done.');
      });
      break;
    }
    case 'vendor': {
      cmd.buildVendor.subscribe(data => {
        console.info(data);
      }, err => {
        throw new Error(err);
      }, () => {
        console.log('Done.');
      });
      break;
    }
    default: {
      let start;
      cmd.buildAll.subscribe(data => {
        console.info(data);
      }, err => {
        throw new Error(err);
      }, () => {
        console.log('Done.');
      });
    }
  }
}

if (args[0] === 'clean') {
  clean.clean().subscribe(data => {
    console.info(data);
  }, err => {
    throw new Error(err);
  }, () => {
    console.log('Done.');
  });
}

