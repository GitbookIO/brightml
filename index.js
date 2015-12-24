var fs = require('fs');

var _ = require('lodash');
var Q = require('q');
var cheerio = require('cheerio');

var rules = require('./rules');

// Main cheerio object
var $;

function Brightml(filename) {
    this.filename = filename;
};

// Replace illegal markdown nested tables by a warning
Brightml.prototype._removeNestedTables = function() {
    console.log('Removing nested tables from HTML...');
    // Check for nested tables
    $('table').has('table').each(function() {
        // Replace nested tables by a warning message
        $(this).find('table').each(function() {
            var replacement = $('<td><b>===== Illegal nested table =====</b> '+$(this).text()+'</td>');
            $(this).parent().replaceWith(replacement);
        });
    });
};

// Ensure a common format for tables
// Move <caption> if any before <table>
// Ensure there is a <thead> containing one <tr> with <th> elements
// The rest is in <tbody> in <td> elements
Brightml.prototype._formatTables = function() {
    console.log('Properly formatting tables...');
    $('table').each(function() {
        $table = $(this);
        // If <table> has children
        if (!!$(this).children().length) {
            // Get children
            $children = $table.children();
            // Get first child type
            var firstChildType = getTagName($children);

            switch (firstChildType) {
                // First child might be a <caption>, move it before <table>
                case 'caption':
                    console.log('Moving caption...');
                    // Move <caption> before <table>
                    $caption = $table.find('caption');
                    $caption.insertBefore($table);
                    // Get actual children
                    $children = $table.children();
                    firstChildType = getTagName($children);

                // Case <tr>, move the first in a new <thead>, others in a new <tbody>
                case 'tr':
                    // Encapsulate first <tr> in a new <thead>
                    $thead = $('<thead></thead>');
                    $children.first().wrap($thead);

                    // Encapsulate others in a new <tbody>
                    $tbody = $('<tbody></tbody>');
                    $tbody.append($children.slice(1));
                    $tbody.insertAfter($thead);
                    break;

                // Case <tbody>, move first <tr> in new <thead>
                case 'tbody':
                    // Create <thead>
                    $thead = $('<thead></thead>');
                    // Capture <tbody>
                    $tbody = $(this).find('tbody');

                    // Encapsulate first <tr> in a <thead>
                    $tbody.children().first().wrap($thead);
                    // Move <thead> before <tbody>
                    $tbody.children().first().insertBefore($tbody);
                    break;
            }
        }
    });

    // Ensure each <thead> cells are <th>
    $('thead').has('td').each(function() {
        // Replace each <td> by a <th>
        $(this).find('td').each(function() {
            var $th = $('<th></th>');
            $th.html($(this).html());
            $(this).replaceWith($th);
        });
    });
};

// Remove <p> from <th>/<td> table cells
Brightml.prototype._cleanTableCells = function() {
    console.log('Cleaning up tables cells...');
    $('td, th').has('p').each(function() {
        // Get paragraph content
        var content = $(this).find('p').html();
        // Replace cell content
        $(this).html(content);
    });
};

// Remove empty or forbidden tags
// Clean up attributes
Brightml.prototype._cleanElements = function() {
    // Iterate over elements
    $('*').each(function() {
        var tagName = getTagName($(this));

        // Remove empty tags
        if (!$(this).text().trim()) {
            if (!_.includes(rules.allowedEmpty, tagName) || !_.size(getTagAttributes($(this)))) {
                return $(this).remove();
            }
        }

        // Remove forbidden HTML tags
        if (!rules.allowed[tagName]) {
            // Set content in a paragraph
            $(this).replaceWith('<p><b>Illegal HTML tag removed : </b>'+$(this).html()+'</p>');
            return;
        }

        // Remove forbidden attributes
        var attributes = getTagAttributes($(this));
        for (var key in attributes) {
            if (!_.includes(rules.allowedAttributes, key) && !_.includes(rules.allowed[tagName], key)) {
                delete attributes[key];
            }
            // Filter schemes
            if (_.includes(rules.schemaAttributes, key)) {
                var link = attributes[key];
                var allowedLink = rules.allowedSchemes.some(function(scheme) {
                    return _.startsWith(link, scheme);
                });
                if (!allowedLink) delete attributes[key];
            }
        }
    });
};

// For <a> tags with an id attribute, set id on parent
Brightml.prototype._setAnchorIds = function() {
    $('a').each(function() {
        var attributes = getTagAttributes($(this));
        if (!!attributes.id) {
            var parentAttributes = getTagAttributes($(this).parent());
            if (!parentAttributes.id) {
                parentAttributes.id = attributes.id;
                delete attributes.id;
            }
        }
    });
};

// Return a tag name in lower case
function getTagName(el) {
    return el[0].name.toLowerCase();
}

// Return the tag attributes
function getTagAttributes(el) {
    return el[0].attribs;
}

// Process HTML
Brightml.prototype.render = function() {
    var d = Q.defer();

    var that = this;

    // Read file and convert to DOM using cheerio
    console.log('Reading HTML file: '+that.filename);
    Q.nfcall(fs.readFile, this.filename)
    .then(function(data) {
        // Convert to DOM using cheerio
        console.log('Parsing HTML...');
        $ = cheerio.load(data);

        // Cleanup elements
        console.log('Cleaning up...');
        that._setAnchorIds();
        that._cleanElements();
        // Cleanup tables
        that._removeNestedTables();
        that._formatTables();
        that._cleanTableCells();

        console.log('Done.');
        return d.resolve($.html());
    })
    .fail(function(err) {
        console.log('Error reading HTML file.');
        console.log(err.stack);
        return d.reject(err);
    });

    return d.promise;
};

module.exports = Brightml;