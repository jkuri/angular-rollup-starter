'use strict';

const IndexHtml = require('./lib/indexHtml');
const arg = process.argv[2];

if (!arg && (arg !== 'prod' || arg !== 'dev')) {
  return;
}

const indexHtml = new IndexHtml();

if (arg === 'prod') {
  indexHtml.prod();
} else if (arg === 'dev') {
  indexHtml.dev();
}

console.log(`index.html successfully generated.`);
