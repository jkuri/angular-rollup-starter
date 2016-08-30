#!/bin/sh

function clean() {
  rm -rf dist/*.js*
}

function build_vendor() {
  rollup -c ./config/rollup.vendor.config.js
  tsc --target es5 --allowJs dist/vendor.es2015.js --out dist/vendor.js &> /dev/null
}

function minify_vendor() {
  uglifyjs dist/vendor.js --screw-ie8 --compress --mangle --output dist/vendor.min.js &> /dev/null
  gzip -k -9 dist/vendor.min.js
}

function build_main() {
  rollup -c ./config/rollup.main.config.js
}

function minify_main() {
  uglifyjs dist/main.js --screw-ie8 --compress --mangle --output dist/main.min.js &> /dev/null
  gzip -k -9 dist/main.min.js
}

function clean_build() {
  rm dist/*.es2015.js*
  rm dist/main.js
  rm dist/vendor.js 
}

echo "Building..."
start=`date +%s`
clean
build_vendor
minify_vendor
build_main
minify_main
clean_build
end=`date +%s`
runtime=$((end-start))
printf "Build finished in %ds.\n" $runtime
