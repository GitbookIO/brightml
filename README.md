# Brightml

Smart utility rendering markdown-ready HTML.

## Install

```Shell
$ npm install brightml
```

## Use

Brightml is promised-based.

```JavaScript
var Brightml = require('brightml');
var converter = new Brightml('index.html');

converter.render()
.then(function (cleanHTML) {
    // Use your cleanHTML as intended
});
```