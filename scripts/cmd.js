'use strict';

const path = require('path');
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
const generateHtml = require('./lib/generate_html');
const copy = require('./lib/copy');
const css = require('./lib/css');
const server = require('./lib/server');
const minify = require('./lib/minify');
const tree = require('nodetree');

const args = process.argv.slice(2);

if (args[0] === 'build' || args[0] === 'b') {
  const cmd = new build.Build();

  switch (args[1]) {
    case 'main':
      cmd.buildMain.subscribe(data => {
        console.info(data);
      }, err => {
        throw new Error(err);
      }, () => {
        console.log('Done.');
      });
      break;
    case 'vendor':
      cmd.buildVendor.subscribe(data => {
        console.info(data);
      }, err => {
        throw new Error(err);
      }, () => {
        console.log('Done.');
      });
      break;
    default:
      let start;
      cmd.buildAll.subscribe(data => {
        console.info(data);
      }, err => {
        throw new Error(err);
      }, () => {
        console.log('Done.');
      });
      break;
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

if (args[0] === 'generate' || args[0] === 'g') {
  switch (args[1]) {
    case 'dev':
      generateHtml.generateDev().subscribe(data => console.log(data));
      console.log('Done.');
      break;
    case 'prod':
      generateHtml.generateProd().subscribe(data => console.log(data));
      console.log('Done.');
      break;
    default:
      generateHtml.generateProd().subscribe(data => console.log(data));
      console.log('Done.');
      break;
  }
}

if (args[0] === 'minify' || args[0] === 'uglify') {
  switch (args[1]) {
    case 'main':
      minify.main().subscribe(data => {
        console.log(data)
      }, err => {
        console.log(err);
      }, () => {
        console.log('Done.');
      });
      break;
    case 'vendor':
      minify.vendor().subscribe(data => {
        console.log(data)
      }, err => {
        console.log(err);
      }, () => {
        console.log('Done.');
      });
      break;
    default:
      minify.all().subscribe(data => {
        console.log(data)
      }, err => {
        console.log(err);
      }, () => {
        console.log('Done.');
      });
      break;
  }
}

if (args[0] === 'serve' || args[0] === 'server' || args[0] === 's') {
  const cmd = new server.Server();
  cmd.watch.subscribe(data => {
    console.log(data);
  }, err => {
    throw new Error(err);
  }, () => {
    console.log('Done.');
  });
}

if (args[0] === 'dist') {
  const cmdBuild = new build.Build();
  const sassSrc = path.resolve(__dirname, '../src/styles/app.sass');
  const cssDest = path.resolve(__dirname, '../dist/css/app.css');
  
  let start = new Date();
  console.log('Prepairing project for production, please wait...');
  console.log('-------------------------------------------------------');

  clean.clean()
  .concat(copy.copyPublic())
  .concat(generateHtml.generateProd())
  .concat(css.compileSass(sassSrc, cssDest))
  .concat(cmdBuild.buildAll)
  .concat(minify.all()).subscribe(data => {
    console.log(data);
  }, err => {
    throw new Error(err);
  }, () => {
    let time = new Date().getTime() - start.getTime();
    console.log('-------------------------------------------------------');
    tree(path.resolve(__dirname, '../dist'));
    console.log('-------------------------------------------------------');
    console.log(`Project generated in ${time}ms.`);
  });
}

module.exports.build = build;
module.exports.clean = clean;
module.exports.generateHtml = generateHtml;
module.exports.copy = copy;
module.exports.css = css;
module.exports.minify = minify;
