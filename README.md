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

## What gets done

Brightml performs the following in order.

#### Clean elements

* Remove empty tags.
* Remove forbidden HTML tags and place their HTML content in a `<p>` instead.
* Remove forbidden HTML attributes.
* Remove unallowed links schema in HTML attributes.

This operation uses the `rules.js` file to determine which tags/attributes/schemes are allowed.

#### Set anchors `id`

Try to set `<a>` tags `id` attribute on their direct parent if possible.

#### Move local references

For each `<a>` tag's `href` attribute local link, move the referenced HTML element before the next `<h1>` tag. This feature is used to prevent breaking of local links and keep them in sight.

#### Remove nested `<table>` tags

Replace nested `<table>` tags by a warning message followed by their content in a simple `<td>` tag.

#### Evenly format `<table>` elements

Ensure every `<table>` elements look the same.

Used schema :

```HTML
<!-- Move caption before <table> if any -->
<caption></caption>

<table>
  <!-- Ensure the first row contains <th> tags in a <thead> element -->
  <thead>
    <tr>
      <th>Title 1</th>
      <th>Title 2</th>
    </tr>
  </thead>
  <!-- Ensure all remaining rows are inside a <tbody> element -->
  <tbody>
    <tr>
      <td>Row 1 - Data 1</td>
      <td>Row 1 - Data 2</td>
    </tr>
    <tr>
      <td>Row 2 - Data 1</td>
      <td>Row 2 - Data 2</td>
    </tr>
  </tbody>
</table>
```

#### Clean table cells

Ensure every `<th>` and `<td>` tags don't contain a `<p>` tag to prevent line breaking.