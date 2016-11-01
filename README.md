# Angular2 Rollup Seed

[![Build Status](https://travis-ci.org/jkuri/angular2-rollup-starter.svg?branch=master)](https://travis-ci.org/jkuri/angular2-rollup-starter)

Angular2 starter seed based on Rollup.
Production builds including AoT steps. 
Starter also comes with Universal support built-in. 

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

To use Universal (isomorphic) steps to prerender content in `.html` files
```sh
npm run roll:prerender
```
