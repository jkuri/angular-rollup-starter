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
  const mainFile = path.resolve(dist, 'main.js');
  const mainFileMap = path.resolve(dist, 'main.js.map');
  const mainFileMin = path.resolve(dist, 'main.min.js');
  const mainFileMinGzip = path.resolve(dist, 'main.min.js.gz');
  const vendorFile = path.resolve(dist, 'vendor.js');
  const vendorFileMap = path.resolve(dist, 'vendor.js.map');
  const vendorFileMin = path.resolve(dist, 'vendor.min.js');
  const vendorFileMinGzip = path.resolve(dist, 'vendor.min.js.gz');
  const index = path.resolve(dist, 'index.html');
  const favicon = path.resolve(dist, 'favicon.ico');

  before(() => {
    build = new cmd.build.Build();
    minify = cmd.minify;
    generate = cmd.generate;
  });

  beforeEach(function(done) {
    cmd.clean.clean().subscribe(() => {
      done();
    });
  });

  it('build:main', (done) => {
    build.buildMain.subscribe(() => { }, err => {
      return false;
    }, () => {
      expect(existsSync(dist)).to.be.equal(true);
      expect(existsSync(mainFile)).to.be.equal(true);
      expect(existsSync(mainFileMap)).to.be.equal(true);
      done();
    });
  });

  it('build:vendor', (done) => {
    build.buildVendor.subscribe(() => { }, err => {
      return false;
    }, () => {
      expect(existsSync(dist)).to.be.equal(true);
      expect(existsSync(vendorFile)).to.be.equal(true);
      expect(existsSync(vendorFileMap)).to.be.equal(true);
      done();
    });
  });

  it('build:all', (done) => {
    build.buildAll.subscribe(() => { }, err => {
      return false;
    }, () => {
      expect(existsSync(dist)).to.be.equal(true);
      expect(existsSync(mainFile)).to.be.equal(true);
      expect(existsSync(mainFileMap)).to.be.equal(true);
      expect(existsSync(vendorFile)).to.be.equal(true);
      expect(existsSync(vendorFileMap)).to.be.equal(true);
      done();
    });
  });

  it('minify:main', (done) => {
    build.buildMain.concat(minify.main()).subscribe(() => { }, err => {
      return false;
    }, () => {
      expect(existsSync(dist)).to.be.equal(true);
      expect(existsSync(mainFile)).to.be.equal(false);
      expect(existsSync(mainFileMap)).to.be.equal(false);
      expect(existsSync(mainFileMin)).to.be.equal(true);
      expect(existsSync(mainFileMinGzip)).to.be.equal(true);
      done();
    });
  });

  it('minify:vendor', (done) => {
    build.buildVendor.concat(minify.vendor()).subscribe(() => { }, err => {
      return false;
    }, () => {
      expect(existsSync(dist)).to.be.equal(true);
      expect(existsSync(vendorFile)).to.be.equal(false);
      expect(existsSync(vendorFileMap)).to.be.equal(false);
      expect(existsSync(vendorFileMin)).to.be.equal(true);
      expect(existsSync(vendorFileMinGzip)).to.be.equal(true);
      done();
    });
  });

  it('minify:all', (done) => {
    build.buildAll.concat(minify.all()).subscribe(() => { }, err => {
      return false;
    }, () => {
      expect(existsSync(dist)).to.be.equal(true);

      expect(existsSync(mainFile)).to.be.equal(false);
      expect(existsSync(mainFileMap)).to.be.equal(false);
      expect(existsSync(mainFileMin)).to.be.equal(true);
      expect(existsSync(mainFileMinGzip)).to.be.equal(true);

      expect(existsSync(dist)).to.be.equal(true);
      expect(existsSync(vendorFile)).to.be.equal(false);
      expect(existsSync(vendorFileMap)).to.be.equal(false);
      expect(existsSync(vendorFileMin)).to.be.equal(true);
      expect(existsSync(vendorFileMinGzip)).to.be.equal(true);
      done();
    });
  });
});
