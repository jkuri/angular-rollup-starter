const path = require('path');
const fs = require('fs');
const _ = require('lodash');

class IndexHTML {
  constructor() {
    this.index = path.resolve(__dirname, '../../src/index.html');
    this.dest = path.resolve(__dirname, '../../dist/index.html');
    this.content = fs.readFileSync(this.index).toString();
    this.compiled = _.template(this.content);
  }

  write(content) {
    fs.writeFileSync(this.dest, content, 'utf8');
  }

  prod() {
    let styles = ['css/app.css'];
    let scripts = ['vendor.min.js', 'main.min.js'];
    this.write(this.compiled({ styles: styles, scripts: scripts }));
  }

  dev() {
    let styles = ['css/app.css'];
    let scripts = ['vendor.js', 'main.js'];
    this.write(this.compiled({ styles: styles, scripts: scripts }));
  }
}

module.exports = IndexHTML;
