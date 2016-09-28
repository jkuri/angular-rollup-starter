'use strict';

const expect = require('chai').expect;
const path = require('path');
const fs = require('fs');
const cmd = require('../../scripts/cmd');
const dist = path.resolve(__dirname, '../../dist');

function existsSync(file) {
  try {
    fs.accessSync(file);
    return true;
  } catch (e) {
    return false;
  }
};

describe('Acceptance: Build System', function() {
  this.timeout(420000);

  let clean, build, minify, generate;
  const appFile = path.resolve(dist, 'app.js');
  const appFileMap = path.resolve(dist, 'app.js.map');
  const appFileGzip = path.resolve(dist, 'app.js.gz');
  const index = path.resolve(dist, 'index.html');
  const favicon = path.resolve(dist, 'favicon.ico');

  before(() => {
    build = new cmd.build.Build();
    generate = cmd.generate;
  });

  beforeEach(function(done) {
    cmd.clean.clean('dist').subscribe(() => {
      done();
    });
  });

  it('build:prod', (done) => {
    build.buildMain.subscribe(() => { }, err => {
      return false;
    }, () => {
      expect(existsSync(dist)).to.be.equal(true);
      expect(existsSync(appFile)).to.be.equal(true);
      expect(existsSync(appFileMap)).to.be.equal(true);
      expect(existsSync(index)).to.be.equal(true);
      expect(existsSync(favicon)).to.be.equal(true);
      done();
    });
  });
});
