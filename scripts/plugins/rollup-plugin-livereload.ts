import * as path from 'path';
import * as lreload from 'livereload';

export function livereload (options) {
  let opts = {};

  if (!options) {
    options = { watch: '' };
  }

  if (typeof options === 'string') {
    options = Object.assign(opts, { watch: options });
  }

  let port = options.port || 35729;
  let server = lreload.createServer(options);
  server.watch(path.resolve(process.cwd(), options.watch));

  opts = Object.assign(opts, options);

  let banner = `document.write('<script src="http://localhost:${port}/livereload.js?snipver=1"></script>')`;

  return {
    name: 'livereload',
    banner: banner
  };
}
