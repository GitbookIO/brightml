# Brightml

Smart utility rendering markdown-ready HTML.

## Install

```Shell
$ npm install brightml
```

## Use

Clean all HTML at once :

```JavaScript
var brightml = require('brightml');

var HTMLString = '<table><tr><td>Title 1</td><td>Title 2</td></tr><tr><td>Data 1</td><td>Data 2</td></tr></table>';

var cleanHTML = brightml.clean(HTMLString);
//  cleanHTML is :
//  <table>
//    <thead>
//      <tr>
//        <th>Title 1</th>
//        <th>Title 2</th>
//      </tr>
//    </thead>
//    <tbody>
//      <tr>
//        <td>Data 1</td>
//        <td>Data 2</td>
//      </tr>
//    </tbody>
//  </table>
```

Or use the module's functions as required :

```JavaScript
var brightml = require('brightml');

var HTMLString = '<table><tr><td>Title 1</td><td>Title 2</td></tr><tr><td>Data 1</td><td>Data 2</td></tr></table>';

brightml.parse(HTMLString);
brightml.formatTables();
var cleanHTML = brightml.render();
//  cleanHTML is :
//  <table>
//    <thead>
//      <tr>
//        <th>Title 1</th>
//        <th>Title 2</th>
//      </tr>
//    </thead>
//    <tbody>
//      <tr>
//        <td>Data 1</td>
//        <td>Data 2</td>
//      </tr>
//    </tbody>
//  </table>
```

## What it does

Using `brightml.clean(html)` performs the following operations in order.

#### brightml.parse(HTMLString)

Convert HTML to DOM using [cheerio](https://github.com/cheeriojs/cheerio).

#### brightml.setAnchorsId()

Try to set `<a>` tags `id` attribute on their direct parent if possible.

#### brightml.cleanElements()

* Remove empty tags.
* Remove forbidden HTML tags and place their HTML content in a `<p>` instead.
* Remove forbidden HTML attributes.
* Remove unallowed links schema in HTML attributes.

This operation uses the `rules.js` file to determine which tags/attributes/schemes are allowed.

#### brightml.moveLocalReferences()

For each `<a>` tag's `href` attribute local link, move the referenced HTML element before the next `<h1>` tag. This feature is used to prevent breaking of local links and keep them in sight.

#### brightml.removeNestedTables()

Replace nested `<table>` tags by a warning message followed by their content in a simple `<td>` tag.

#### brightml.formatTables()

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

#### brightml.cleanTableCells()

Ensure every `<th>` and `<td>` tags don't contain a `<p>` tag to prevent line breaking.

#### brightml.render()

Returns the current state of `HTMLString` passed to `brightml.parse(HTMLString)`.