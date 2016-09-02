declare var __karma__: any;

__karma__.loaded = () => { };

import 'core-js/client/shim';
import 'reflect-metadata';
import 'zone.js/dist/zone';
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/proxy';
import 'zone.js/dist/jasmine-patch';

import * as rxjs from 'rxjs/Rx';

import * as testing from '@angular/core/testing';
import * as testingBrowser from '@angular/platform-browser-dynamic/testing';

testing.TestBed.initTestEnvironment(
  testingBrowser.BrowserDynamicTestingModule,
  testingBrowser.platformBrowserDynamicTesting()
);

import './app/app.component.spec';

__karma__.start();
