var should = require('should');
var brightml = require('../index.js');

describe('brightml.parse() / brightml.render()', function() {
    it('should render exactly what was given', function() {
        var input = '<table>'+
            '<caption>Data table</caption>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td>Data 1.1</td><td>Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        var correctOutput = '<table>'+
            '<caption>Data table</caption>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td>Data 1.1</td><td>Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        brightml.parse(input);
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });
});

describe('brightml.formatTables()', function() {
    it('should move <caption> before <table>', function() {
        var input = '<table>'+
            '<caption>Data table</caption>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td>Data 1.1</td><td>Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        var correctOutput = '<caption>Data table</caption>'+
        '<table>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td>Data 1.1</td><td>Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        brightml.parse(input);
        brightml.formatTables();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });

    it('should create <thead> and <tbody>', function() {
        var input = '<table>'+
            '<tr><td>Title 1</td><td>Title 2</td></tr>'+
            '<tr><td>Data 1.1</td><td>Data 1.2</td></tr>'+
            '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
        '</table>';

        var correctOutput = '<table>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td>Data 1.1</td><td>Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        brightml.parse(input);
        brightml.formatTables();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });

    it('should move the first row of <tbody> in a new <thead>', function() {
        var input = '<table>'+
            '<tbody>'+
                '<tr><td>Title 1</td><td>Title 2</td></tr>'+
                '<tr><td>Data 1.1</td><td>Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        var correctOutput = '<table>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td>Data 1.1</td><td>Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        brightml.parse(input);
        brightml.formatTables();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });
});

describe('brightml.cleanTableCells()', function() {
    it('should remove <p> tags from <th> and <td>', function() {
        var input = '<table>'+
            '<thead>'+
                '<tr><th><p>Title 1</p></th><th><p>Title 2</p></th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td><p>Data 1.1</p></td><td><p>Data 1.2</p></td></tr>'+
                '<tr><td><p>Data 2.1</p></td><td><p>Data 2.2</p></td></tr>'+
            '</tbody>'+
        '</table>';

        var correctOutput = '<table>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td>Data 1.1</td><td>Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        brightml.parse(input);
        brightml.cleanTableCells();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });
});

describe('brightml.removeNestedTables()', function() {
    it('should remove nested <table> elements', function() {
        var input = '<table>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td>'+
                    '<table><tbody><tr><td>Data 1.1</td><td>Data 1.2</td></tr></tbody></table>'+
                '</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        var correctOutput = '<table>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td><b>Illegal nested table :</b> Data 1.1Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        brightml.parse(input);
        brightml.removeNestedTables();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });
});

describe('brightml.setAnchorsId()', function() {
    it('should set the empty <a> tag id on its direct parent', function() {
        var input = '<p>'+
            '<a id="my-link"></a>'+
            'Sample text'+
        '</p>';

        var correctOutput = '<p id="my-link">'+
            '<a></a>'+
            'Sample text'+
        '</p>';

        brightml.parse(input);
        brightml.setAnchorsId();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });

    it('should not replace the direct parent existing id', function() {
        var input = '<p id="mytext">'+
            '<a id="my-link"></a>'+
            'Sample text'+
        '</p>';

        var correctOutput = '<p id="mytext">'+
            '<a id="my-link"></a>'+
            'Sample text'+
        '</p>';

        brightml.parse(input);
        brightml.setAnchorsId();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });
});

describe('brightml.moveLocalReferences()', function() {
    it('should move the referenced <p> tag before the next <h1> tag', function() {
        var input = '<h1>Part 1</h1>'+
        '<p>'+
            '<a href="#first-distant-paragraph">Link to first paragraph</a>'+
            'Sample text'+
        '</p>'+
        '<a href="#second-distant-paragraph">Link to second paragraph</a>'+
        '<h1>Part 2</h1>'+
        '<p id="first-distant-paragraph">'+
            'This should move'+
        '</p>'+
        '<h1>Part 3</h1>'+
        '<p id="second-distant-paragraph">'+
            'This too'+
        '</p>';

        var correctOutput = '<h1>Part 1</h1>'+
        '<p>'+
            '<a href="#first-distant-paragraph">Link to first paragraph</a>'+
            'Sample text'+
        '</p>'+
        '<a href="#second-distant-paragraph">Link to second paragraph</a>'+
        '<p id="first-distant-paragraph">'+
            'This should move'+
        '</p>'+
        '<p id="second-distant-paragraph">'+
            'This too'+
        '</p>'+
        '<h1>Part 2</h1>'+
        '<h1>Part 3</h1>';

        brightml.parse(input);
        brightml.moveLocalReferences();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });
});

describe('brightml.cleanElements()', function() {
    it('should remove empty tags', function() {
        var input = '<p>'+
            'Sample text'+
            '<a href="http://lost.com"></a>'+
            '<img src="./logo.png">'+
        '</p>';

        var correctOutput = '<p>'+
            'Sample text'+
            '<img src="./logo.png">'+
        '</p>';

        brightml.parse(input);
        brightml.cleanElements();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });

    it('should remove unallowed tags', function() {
        var input = '<p>'+
            'Sample text'+
            '<memo>This should become a span</memo>'+
        '</p>'+
        '<memo>This should turn into a p</memo>';

        var correctOutput = '<p>'+
            'Sample text'+
            '<span><b>Illegal HTML tag removed : </b>This should become a span</span>'+
        '</p>'+
        '<p><b>Illegal HTML tag removed : </b>This should turn into a p</p>';

        brightml.parse(input);
        brightml.cleanElements();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });

    it('should remove unallowed attributes', function() {
        var input = '<h1 id="first-title" title="part-1">'+
            'Part 1'+
        '</h1>';

        var correctOutput = '<h1 id="first-title">'+
            'Part 1'+
        '</h1>';

        brightml.parse(input);
        brightml.cleanElements();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });

    it('should remove unallowed links schemes', function() {
        var input = '<a href="https://github.com/me/my-git-repo.git">'+
            'Authorized link to my secret git repo'+
        '</a>'+
        '<a href="git://my-git-repo.git">'+
            'Unallowed link to my secret git repo'+
        '</a>';

        var correctOutput = '<a href="https://github.com/me/my-git-repo.git">'+
            'Authorized link to my secret git repo'+
        '</a>'+
        '<a>'+
            'Unallowed link to my secret git repo'+
        '</a>';

        brightml.parse(input);
        brightml.cleanElements();
        var output = brightml.render();

        output.should.be.equal(correctOutput);
    });
});

describe('brightml.clean()', function() {
    it('should do all this at once', function() {
        var input = '<h1 id="first-title" title="part-1">Part 1</h1>'+
        '<p>'+
            '<a id="first-paragraph"></a>'+
            '<a href="#first-distant-paragraph">Link to first paragraph</a>'+
            'Sample text'+
        '</p>'+
        '<a href="#second-distant-paragraph">Link to second paragraph</a>'+
        '<h1>Part 2</h1>'+
        '<p id="first-distant-paragraph">'+
            '<a href="http://lost.com"></a>'+
            '<img src="./logo.png">'+
            'This should move'+
        '</p>'+
        '<h1>Part 3</h1>'+
        '<p id="second-distant-paragraph">'+
            '<a id="fake-second-distant-paragraph"></a>'+
            'This too'+
            '<memo>This should become a span</memo>'+
        '</p>'+
        '<table>'+
            '<caption>Data table</caption>'+
            '<tr><td>Title 1</td><td>Title 2</td></tr>'+
            '<tr><td>'+
                    '<table><tbody><tr><td>Data 1.1</td><td>Data 1.2</td></tr></tbody></table>'+
            '</td></tr>'+
            '<tr><td><p>Data 2.1</p></td><td><p>Data 2.2</p></td></tr>'+
        '</table>';

        var correctOutput = '<h1 id="first-title">Part 1</h1>'+
        '<p id="first-paragraph">'+
            '<a href="#first-distant-paragraph">Link to first paragraph</a>'+
            'Sample text'+
        '</p>'+
        '<a href="#second-distant-paragraph">Link to second paragraph</a>'+
        '<p id="first-distant-paragraph">'+
            '<img src="./logo.png">'+
            'This should move'+
        '</p>'+
        '<p id="second-distant-paragraph">'+
            'This too'+
            '<span><b>Illegal HTML tag removed : </b>This should become a span</span>'+
        '</p>'+
        '<h1>Part 2</h1>'+
        '<h1>Part 3</h1>'+
        '<caption>Data table</caption>'+
        '<table>'+
            '<thead>'+
                '<tr><th>Title 1</th><th>Title 2</th></tr>'+
            '</thead>'+
            '<tbody>'+
                '<tr><td><b>Illegal nested table :</b> Data 1.1Data 1.2</td></tr>'+
                '<tr><td>Data 2.1</td><td>Data 2.2</td></tr>'+
            '</tbody>'+
        '</table>';

        var output = brightml.clean(input);
        output.should.be.equal(correctOutput);
    });
});