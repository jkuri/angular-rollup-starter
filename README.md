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

### Universal (Isomorphic) Production Build

```sh
npm run roll:prerender
```

Routes stored in `config.json` as `universalRoutes` will be prerendered into `dist/` directory.
For example
```json
{
  "externalPackages": { },
  "styles": ["css/app.css"],
  "universalRoutes": ["/", "/docs", "/docs/child"]
}
```

will generate prerendered content in `dist/index.html` `dist/docs.html` and `dist/docs/child.html`.

To properly serve prerendered content use below `nginx` configuration.
```nginx
server {
  listen 80;
  server_name subdomain.example.com example.com;

  root /path/to/dist;

  location / {
    try_files $uri.html $uri $uri/ /index.html;
  }
}
```

### Licence

MIT
