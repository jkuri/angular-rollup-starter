import 'core-js/es6/symbol';
import 'core-js/es6/object';
import 'core-js/es6/function';
import 'core-js/es6/parse-int';
import 'core-js/es6/parse-float';
import 'core-js/es6/number';
import 'core-js/es6/math';
import 'core-js/es6/string';
import 'core-js/es6/date';
import 'core-js/es6/array';
import 'core-js/es6/regexp';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/weak-map';
import 'core-js/es6/weak-set';
import 'core-js/es6/typed';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone-node';
import 'zone.js/dist/long-stack-trace-zone';

import { enableProdMode } from '@angular/core';
import { platformNodeDynamic } from 'ng2-platform-node';

import { AppModule } from '../../src/app/app.module.universal';
import * as path from 'path';
import * as fs from 'fs';
import { Observable } from 'rxjs';
import { generateFromString } from './generate_html';

declare var Zone: any;

export function run(): Observable<any> {
  return new Observable(observer => {
    const options = {
      precompile: true,
      preboot: true,
      time: false,
      ngModule: AppModule,
      document: fs.readFileSync(path.resolve(__dirname, '../../src/index.html')).toString()
    };

    const platformRef: any = platformNodeDynamic();

    const zone = Zone.current.fork({
      properties: options
    });

    zone.run(() => (platformRef.serializeModule(options.ngModule, options)).then(html => {
      generateFromString(html.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
      observer.complete();
    }));
  });
};
