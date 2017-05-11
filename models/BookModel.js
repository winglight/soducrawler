"use strict";
var Parse = require('parse/node');
var debug = require('debug')('debug');

class BookModel extends Parse.Object {
    constructor() {
        // Pass the ClassName to the Parse.Object constructor
        super('BookModel');

        this.name = "unknown";
        this.url = "";
        this.cover = "";
        this.newest = "";
        this.updatedate = "";
        this.rank = 100000;
        this.chapters = [];
        this.sources = [];//book sources entries
    }

    findByUrl(url) {
        var query = new Parse.Query(BookModel);
        query.equalTo("url", url);
        return query.find();
    }

    refreshDataFromParse() {
      this.name = this.get("name");
      this.url = this.get("url");
      this.cover = this.get("cover");
      this.newest = this.get("newest");
      this.updatedate = this.get("updatedate");
      this.rank = this.get("rank");
      this.chapters = this.get("chapters");
      // console.log("book cover: " + this.cover);
      return {
        'id': this.get("objectId"),
        'name': this.name,
        'url': this.url,
        'cover': this.cover,
        'newest': this.newest,
        'updatedate': this.updatedate,
        'rank': this.rank,
        'chapters': this.chapters
      }
    }

    delete() {
        this.destroy({
            success: function(myObject) {
                // The object was deleted from the Parse Cloud.
                debug("Successfully deleted " + myObject.url);
            },
            error: function(myObject, error) {
                // The delete failed.
                // error is a Parse.Error with an error code and message.
                debug("deleted error:" + error);
            }
        });
    }

    update() {
        this.set("name", this.name);
        this.set("url", this.url);
        this.set("cover", this.cover);
        this.set("newest", this.newest);
        this.set("updatedate", this.updatedate);
        this.set("rank", this.rank);
        // this.set("chapters", this.chapters);

        var that = this;

        return this.findByUrl(this.url).then(function(results) {
            if ( results.length > 0) {
                var object = results[0];
                debug(object.id + ' - ' + object.get('url'));

                that.id = object.id;
                that.chapters = object.chapters;

                debug('update object.chapters - ' + JSON.stringify(object.chapters));
                // object.delete();
            }
            debug("save book begin ");
            return that.save();

        });



    }

}

Parse.Object.registerSubclass('BookModel', BookModel);

module.exports = BookModel;
