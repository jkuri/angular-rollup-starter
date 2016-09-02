<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1796022/18214723/88e68946-714e-11e6-9f46-cc9113454222.png" alt="Angular2 + Rollupjs" width="500px" height="300px">
</p>

# Angular2 Rollup Seed

Angular2 starter seed based on Rollup and BrowserSync. 

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

```sh
npm run roll
```

### 

### SASS Support

This starter comes with integrated SASS support. Just rename `src/styles/app.css` to `src/styles/app.sass` 
and that file will serves as the entry point. Any other `.sass` files should be imported into main `app.sass`.
This is hardcoded for now, but can change in the future for more flexible style alignement.
