const SpecReporter = require('jasmine-spec-reporter');
const path = require('path');

exports.config = {
  baseUrl: 'http://localhost:4200',
  specs: [
    path.resolve(__dirname, '../e2e/**/*.e2e.ts')
  ],
  exclude: [],
  framework: 'jasmine2',
  allScriptsTimeout: 120000,
  jasmineNodeOpts: {
    showTiming: true,
    showColors: true,
    isVerbose: false,
    includeStackTrace: false,
    defaultTimeoutInterval: 400000
  },
  directConnect: true,
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: ['show-fps-counter=true']
    }
  },
  useAllAngular2AppRoots: true,
  beforeLaunch: () => {
    require('ts-node').register({
      project: path.resolve(__dirname, '../e2e')
    });
  },
  onPrepare: () => {
    jasmine.getEnv().addReporter(new SpecReporter());
  }
};
