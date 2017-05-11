var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug'
});
var base_url = 'http://www.cartoonmad.com';

function getMenuLinks() {
    var links = document.querySelectorAll('a.tmemu');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}

function getBookLinks() {

  var  books = document.querySelectorAll('a');
    casper.log('get book size:' + books.length, 'debug');
    return Array.prototype.map.call(books, function(e) {
        var book = {};
        book.title = e.getAttribute('title');
        book.href = e.getAttribute('href');
        if(book.href.indexof("comic/") == 0){
        return book;
      }
    });
}

casper.start(base_url, function() {
    this.echo(this.getTitle());
});

casper.then(function() {
    // aggregate results for the 'casperjs' search
    menus = this.evaluate(getMenuLinks);
    });

casper.then(function() {
  casper.log('get menu page', 'debug');


    //get topics list from links
    // menus.forEach(function(link) {
      // if(link.indexof("/") == 0){

      // }
    // }, this);
});

casper.thenOpen(base_url + "/hotrank.html", function() {
  this.echo("Books:" + this.getTitle());

  books = getBookLinks();

  this.echo(' - ' + books.join('\n - ')).exit();
});

casper.run(function() {
    // echo results in some pretty fashion
    this.echo(menus.length + ' menu found:');
    this.echo(' - ' + menus.join('\n - ')).exit();
});
