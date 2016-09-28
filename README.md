<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1796022/18933885/1d9ee578-85d7-11e6-8e17-1451bd97a450.png" alt="Angular2 + Rollupjs" width="600px" height="300px">
</p>

[![Build Status](https://travis-ci.org/jkuri/angular2-rollup-starter.svg?branch=master)](https://travis-ci.org/jkuri/angular2-rollup-starter)

# Angular2 Rollup Seed

Angular2 starter seed based on Rollup and BrowserSync.
Production builds including AoT steps. 

## Start

First, clone this repository.

```sh
git clone https://github.com/jkuri/angular2-rollup-starter.git
```

Move into cloned directory and run 

```sh
npm install
```

## Usage

### Serve

```sh
npm run serve
```

***Note*** Initial load takes some time so vendor files are generated. 
Then it runs like a charm with cached builds which happens to be really fast.

This serves your app with live-reload enabled.

### Production Build

Production builds automatically includes AoT (Ahead of Time) compilation steps. 

```sh
npm run roll
```

### 

### SASS Support

This starter comes with integrated SASS support. Just rename `src/styles/app.css` to `src/styles/app.sass` 
and that file will serves as the entry point. Any other `.sass` files should be imported into main `app.sass`.
This is hardcoded for now, but can change in the future for more flexible style alignement.
