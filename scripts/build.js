const Watcher = require('./lib/watcher');
const watcher = new Watcher();

watcher.clean().then(() => {
  console.log('Building...');
  watcher.initBuild().then(() => {
    process.exit(0);
  });
});
