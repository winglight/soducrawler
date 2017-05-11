var Crawler = require("js-crawler");
var http = require('follow-redirects').http;
var charset = require('charset');

var Cheerio = require('cheerio');

var read = require('node-readability');

var Buffer = require('buffer').Buffer;
var iconv = require('iconv-lite');
// var iconv = new Iconv('big5', 'UTF-8');

var debug = require('debug')('debug');

var BookModel = require('./models/BookModel.js');
var ChapterModel = require('./models/ChapterModel.js');

var Parse = require('parse/node');
Parse.initialize("sodureader", "", "PNGTXQnCgRsSjXcwhvmtvQJG");
Parse.serverURL = 'https://sodureader.herokuapp.com/parse';

var base_url = 'http://www.soduso.com';

var chunks = [];

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function crawlChapterContent(chapter, char) {
  read(chapter.url, function(err, article, meta) {
    if(!err){
      chapter.content = article.content;
      debug('chapter content: ' + chapter.content.length);
      chapter.update();

      article.close();
    }else {
      debug("crawlChapterContent read error:" + err);
    }
    // // Main Article
    // console.log(article.content);
    // // Title
    // console.log(article.title);
    //
    // // HTML Source Code
    // console.log(article.html);
    // // DOM
    // console.log(article.document);
    //
    // // Response Object from Request Lib
    // console.log(meta);

    // Close article to clean up jsdom and prevent leaks

  });
    // getBodyByURL(chapter.url, function onSuccess(body) {
    //   var content = '';
    //
    //     $ = Cheerio.load(body, {decodeEntities: false});
    //
    //     var ele = $('div').filter(function(i, el) {
    //       // debug('div id:' + $(this).attr('id'));
    //       return $(this).attr('id') === 'content' || $(this).attr('id') === 'contents' || ($(this).attr('id') && $(this).attr('id').toLowerCase() === 'booktext');
    //     });
    //
    //     if(ele){
    //       content = ele.text();
    //     }else {
    //       content = $('body').text();
    //     }
    //
    //     ele = $('a').filter(function(i, el) {
    //       return $(this).text() === '上一章' || $(this).text() === '上一页' || $(this).text() === '前一章';
    //     });
    //     if(ele){
    //       chapter.prev = convertFullUrl(chapter.url, ele.attr('href'));
    //     }
    //
    //     ele = $('a').filter(function(i, el) {
    //       return $(this).text() === '下一章' || $(this).text() === '下一页' || $(this).text() === '后一章';
    //     });
    //     if(ele){
    //       chapter.next = convertFullUrl(chapter.url, ele.attr('href'));
    //     }
    //
    //     debug('chapter content: ' + content.length);
    //         chapter.content = content;
    //         chapter.update();
    // }, char);
}

function crawlSrouces(book) {
    getBodyByURL(book.url, function onSuccess(content) {

        var sources = [];

        // debug("book id:" + book.id);

        $ = Cheerio.load(content, {decodeEntities: false});

        $('a').filter(function(i, el) {
            // this === el
            var url = $(this).attr('href');
            var title = $(this).text();
            // debug("chapters url:" + url);
            // debug("chapters title:" + title);
            if (url && title && url.indexOf("/go_") == 0 && url.length > 46) {
                  var source = new Object();

                  source.chapter = title;
                  source.name = $(this).parent().next('div').text();
                  source.url = base_url + url;

                  sources.push(source);
                  // debug("source name:" + source.name);
            }
        });

        book.save("sources", sources);

        crawlChapters(book, sources);

    }, 'gb2312');
}

function crawlChapters(book, sources, char) {
  var latestChapterUrl = null;

  if(sources && sources.length > 0){
    var source = sources[0];
    // debug("book source 1: " + JSON.stringify(source));
    latestChapterUrl = source.url;
  }

  if(latestChapterUrl){
    var listUrl = null;

    debug("book latestChapter url: " + latestChapterUrl);

    if(!char){
        getBodyByURL(latestChapterUrl, function onSuccess(content) {
          debug("got charset: " + content);
          crawlChapters(book, sources, content);

        });
        return;
    }

    getBodyByURL(latestChapterUrl, function onSuccess(content, currentUrl) {
      $ = Cheerio.load(content, {decodeEntities: false});

      listUrl = $('a').filter(function(i, el) {
        return $(this).text() === '章节列表' || $(this).text() === '章节目录' || $(this).text() === '目录';
      }).attr('href');

        debug("book list url:" + listUrl);
        debug("currentUrl url:" + currentUrl);

        if(listUrl){
          listUrl = convertFullUrl(currentUrl, listUrl);
          var oldChapters = [];
           var chapters = [];

           if(book.chapters){
             oldChapters = book.chapters;
           }

          getBodyByURL(listUrl, function onSuccess(content) {
            $ = Cheerio.load(content, {decodeEntities: false});

            var seq = 0;

            $('a').filter(function(i, el) {
              if($(this).parent().is('dd') || $(this).parent().is('td')){
                var chapter = new ChapterModel();

                  chapter.parent = book.id;
                  seq = seq + 1;
                  chapter.seq = seq;

                  // debug("chapter parent name:" + book.name);
                  chapter.name = $(this).text();

                  chapter.url = convertFullUrl(listUrl, $(this).attr('href'));

                  chapter.update().then(function(result) {

                    debug("chapter title:" + result.name);
                    debug("oldChapters:" + JSON.stringify(oldChapters));
                    if(!([oldChapters].includes(result.name)) && !result.content){
                      debug("begin crawlChapterContent char: " + char);
                      crawlChapterContent(result,char);
                    }
                  });

                  chapters.push(chapter);
              }
            });

            book.save("chapters", chapters);
          }, char);

        }
    }, char);
  }
}

function crawlCartoonByPage(page) {
    var start = (page-1)*80;

    getBodyByURL(base_url + "/top_" + page + ".html", function onSuccess(content) {
        $ = Cheerio.load(content, {decodeEntities: false});

        var books = [];

        var rank = 0;

        $('a').filter(function(i, el) {
            // this === el
            var url = $(this).attr('href');
            var title = $(this).text();
            var width = $(this).parent().css('width');

            if (url && title && url.indexOf("/mulu_") == 0 && !title.includes(" ") && width === '188px') {
                // debug("book:" + url);
                // debug("title:" + title);

                var newest = $(this).parent().next('div');

                debug("converted title:" + title);

                var book = new BookModel();

                book.name = title;
                book.url = base_url + url;
                if(newest){
                  book.newest = newest.text();
                }

                newest = newest.next('div');
                if(newest){
                  book.updatedate = newest.text();
                }

                rank = rank + 1;
                book.rank = start + rank;

                book.update().then(function(result) {
                    // debug("result id:" + result.id);
                    crawlSrouces(result);

                    // crawlChapters(result);
                });

                books.push(book);
            }
        });

        if (books.length > 0 && page < 100) {
            debug("page:" + page);
            // debug("parseInt(page, 10):" + parseInt(page, 10));
            crawlCartoonByPage(page + 1);
        }

    }, 'gb2312');

}

function getBodyByURL(url, callback, char) {
  if(!char){
    http.get(url, function (res) {
      res.on('data', function (chunk) {
        char = charset(res.headers, chunk);
        console.log("charset: " + char);

        // or `console.log(charset(res, chunk));`
        if(callback){
          callback(char);
        }
        res.destroy();
      });
      res.on('error', function (error) {
        debug('getBodyByURL charset error:' + error);
        res.destroy();
      });
    }).on('error', function(error) {
      // Call callback function with the error object which comes from the request
      debug('getBodyByURL charset error2:' + error);
    });
  }else{
    http.get(url, function(res) {
      res.pipe(iconv.decodeStream(char)).collect(function(error, decodedBody) {
        if(!error){
          if(callback){
            callback(decodedBody, res.responseUrl);
          }
        }else{
          debug('getBodyByURL error:' + error);
        }
        res.destroy();
      });
    }).on('error', function(error) {
      // Call callback function with the error object which comes from the request
      debug('getBodyByURL error2:' + error);
    });
  }
}

function crawlAll() {
    crawlCartoonByPage(1);
    // new BookModel().findByUrl("http://www.soduso.com/mulu_3627785.html").then(function(results) {
    //   for (var i = 0; i < results.length; i++) {
    //       var object = results[i];
    //       // debug("object:" + JSON.stringify(object));
    //       debug("object sources:" + object.sources);
    //       object.url = object.get("url");
    //         crawlChapters(object, object.get('sources'));
    //   }
    //
    //
    // },function(error) {
    // debug("Error: " + error.code + " " + error.message);
    // });
}

function getRootUrl(url) {
  if(url && url.toString()){
    return url.toString().replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
  }else {
    return '';
  }
}

function convertFullUrl(base, relative) {
  if(base){
    if(relative.indexOf('/') == 0){
      return getRootUrl(base) + relative;
    }else if(relative.indexOf('http') == 0){
      return relative;
    }else{
      var stack = base.split("/"),
          parts = relative.split("/");
      stack.pop(); // remove current file name (or empty string)
                   // (omit if "base" is the current folder without trailing slash)
      for (var i=0; i<parts.length; i++) {
          if (parts[i] == ".")
              continue;
          if (parts[i] == "..")
              stack.pop();
          else
              stack.push(parts[i]);
      }
      return stack.join("/");
    }
  }else {
    return '';
  }
}

crawlAll();

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}
