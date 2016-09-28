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

  let clean, build, generate;
  const appFile = path.join(dist, 'app.js');
  const appFileMap = path.join(dist, 'app.js.map');
  const appFileGzip = path.join(dist, 'app.js.gz');
  const index = path.join(dist, 'index.html');
  const favicon = path.join(dist, 'favicon.ico');

  before(() => {
    build = new cmd.build.Build();
    generate = cmd.generate;
  });

  beforeEach(function(done) {
    cmd.clean.clean('dist').subscribe(() => { }, (err) => {
      throw new Error(err);
    }, () => {
      cmd.clean.clean('aot').subscribe(() => { }, (err) => {
        throw new Error(err);  
      }, () => {
        done();
      });
    });
  });

  after((done) => {
    cmd.clean.clean('dist').subscribe(() => { }, (err) => {
      throw new Error(err);
    }, () => {
      cmd.clean.clean('aot').subscribe(() => { }, (err) => {
        throw new Error(err);  
      }, () => {
        done();
      });
    });
  });

  it('build', (done) => {
    build.buildProd.subscribe(() => { }, err => {
      return false;
    }, () => {
      expect(existsSync(dist)).to.be.true;
      expect(existsSync(appFile)).to.be.true;
      expect(existsSync(appFileMap)).to.be.true;
      done();
    });
  });
});
