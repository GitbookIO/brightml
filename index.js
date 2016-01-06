var fs = require('fs');

var _ = require('lodash');
var cheerio = require('cheerio');

var rules = require('./rules');

// Main DOM object
var $;

// Replace illegal markdown nested tables by a warning
function removeNestedTables() {
    var message = '<b>Illegal nested table :</b>';
    // Check for nested tables
    $('table').has('table').each(function() {
        // Replace nested tables by a warning message
        $(this).find('table').each(function() {
            var $replacement = $('<td>'+message+' '+$(this).text()+'</td>');
            $(this).parent().replaceWith($replacement);
        });
    });
};

// Ensure a common format for tables
// Move <caption> if any before <table>
// Ensure there is a <thead> containing one <tr> with <th> elements
// The rest is in <tbody> in <td> elements
function formatTables() {
    $('table').each(function() {
        $table = $(this);
        // If <table> has children
        if (!!$(this).children().length) {
            // Get children
            $children = $table.children();
            // Get first child type
            var firstChildType = getTagName($children);

            // First child might be a <caption>
            if (firstChildType === 'caption') {
                // Move it before the <table> tag
                $caption = $table.find('caption');
                $caption.insertBefore($table);
                // Get actual remaining children to process
                $children = $table.children();
                firstChildType = getTagName($children);
            }

            switch (firstChildType) {
                // Case <tr>, move the first in a new <thead> and the others in a new <tbody>
                case 'tr':
                    // Encapsulate first <tr> in a new <thead>
                    $thead = $('<thead></thead>');
                    $children.first().wrap($thead);

                    // Encapsulate others in a new <tbody>
                    $tbody = $('<tbody></tbody>');
                    $tbody.append($children.slice(1));
                    $tbody.insertAfter($thead);
                    break;

                // Case <tbody>, move the first <tr> in new <thead>
                case 'tbody':
                    // Create <thead>
                    $thead = $('<thead></thead>');
                    // Capture <tbody>
                    $tbody = $(this).find('tbody');

                    // Encapsulate the first <tr> in a <thead>
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
function cleanTableCells() {
    $('td, th').has('p').each(function() {
        // Get paragraph content
        var content = $(this).find('p').html();
        // Replace cell content
        $(this).html(content);
    });
};

// Remove empty or forbidden tags
// Clean up attributes
function cleanElements() {
    // Iterate over elements
    $('*').each(function() {
        var tagName = getTagName($(this));

        // Remove empty tags
        if (!$(this).html().trim()) {
            if (!_.includes(rules.allowedEmpty, tagName)) {
                return $(this).remove();
            }
        }

        // Remove forbidden HTML tags
        if (!rules.allowed[tagName]) {
            // Set content in a <p> tag or in a <span> if parent is a <p>
            var warning = '<b>Illegal HTML tag removed : </b>'+$(this).html();

            var $container = $('<p></p>');
            var $parent = $(this).parent();
            var parentTag;

            if (!!$parent.length) parentTag = getTagName($parent);
            if (parentTag === 'p') $container = $('<span></span>');
            $container.html(warning);

            $(this).replaceWith($container);
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

// For empty <a> tags with an id attribute, set id on parent
function setAnchorsId() {
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

// Move local referenced tags before next <h1>
// Prevent moving title tags
function moveLocalReferences() {
    $('a').each(function() {
        // Check if href is an id link
        var attributes = getTagAttributes($(this));
        var href = attributes.href;

        if (!!href && _.startsWith(href, '#')) {
            // Get referenced element
            var $referencedTag = $(href);
            if (!$referencedTag.length) return;

            var tagName = getTagName($referencedTag);
            if (_.startsWith(tagName, 'h')) return;

            // Check existence
            if (!_.isUndefined($referencedTag.get(0))) {
                var $nextH1 = getNextH1($(this));
                // Move before next <h1> if found
                if (!_.isNull($nextH1)) {
                    // Change to a <p> before moving
                    var $replacement;
                    if ($referencedTag.children().length === 1 && $referencedTag.children().first().is('p')) {
                        $replacement = $referencedTag.children().first();
                    }
                    else {
                        $replacement = $('<p>'+$referencedTag.html()+'</p>');
                    }

                    // Copy attributes
                    var referencedTagAttributes = getTagAttributes($referencedTag);
                    for (var attr in referencedTagAttributes) {
                        $replacement.attr(attr, referencedTagAttributes[attr]);
                    }
                    // Replace and move
                    $referencedTag.replaceWith($replacement);
                    $replacement.insertBefore($nextH1);
                }
            }
        }
    });
};

// Return the closest <h1> to an element
function getNextH1(el) {
    // Try to get next sibling
    var $nextH1 = el.nextAll('h1').get(0);

    // Switch element to its parent while not found
    while (_.isUndefined($nextH1)) {
        el = el.parent();
        // Return null if element has no parent
        if (_.isUndefined(el.get(0))) return null;
        $nextH1 = el.nextAll('h1').get(0);
    }

    return $nextH1;
};

// Return a tag name in lower case
function getTagName(el) {
    return el.get(0).name.toLowerCase();
}

// Return the tag attributes
function getTagAttributes(el) {
    return el.get(0).attribs;
}

function parse(html) {
    $ = cheerio.load(html);
}

function render() {
    return $.html();
}

// Process an HTML string
function clean(html) {
    // Convert to DOM using cheerio
    parse(html);

    // Cleanup elements
    setAnchorsId();
    cleanElements();
    moveLocalReferences();
    // Cleanup tables
    removeNestedTables();
    formatTables();
    cleanTableCells();

    return render();
};

module.exports = {
    clean: clean,
    parse: parse,
    render: render,
    cleanElements: cleanElements,
    setAnchorsId: setAnchorsId,
    moveLocalReferences: moveLocalReferences,
    removeNestedTables: removeNestedTables,
    formatTables: formatTables,
    cleanTableCells: cleanTableCells
};