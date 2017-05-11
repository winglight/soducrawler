"use strict";
var Parse = require('parse/node');

var debug = require('debug')('debug');

class ChapterModel extends Parse.Object {
    constructor() {
        // Pass the ClassName to the Parse.Object constructor
        super('ChapterModel');

        this.name = "unknown";
        this.parent = {};
        this.url = "";
        this.content = "";
        this.prev = "";//前一章id
        this.next = "";//后一章id
        this.seq = 10000;//顺序
        this.images = [];
    }

    findByUrl(url) {
        var query = new Parse.Query(ChapterModel);
        query.equalTo("url", url);
        return query.find();
    }

    findChpatersByBook(bookid) {
      // console.log(' begin findChpatersByBook');
        var query = new Parse.Query(ChapterModel);
        // query.ascending("createdAt");
        query.equalTo("parent", bookid);
        return query.find();
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
        this.set("parent", this.parent);
        this.set("url", this.url);
        this.set("content", this.content);
        this.set("prev", this.prev);
        this.set("next", this.next);
        this.set("seq", this.seq);
        this.set("images", this.images);

        var that = this;

        // debug("save chapter begin ");

        return this.findByUrl(this.url).then(function(results) {
          if ( results.length > 0) {
              var object = results[0];
              // debug(object.id + ' - ' + object.get('url'));

              that.id = object.id;

              if(object.get('content') && !that.content){
                that.content = object.get('content');
              }
              // object.delete();
          }
            // debug("save chapter begin ");

            return that.save();
        });
    }

}

Parse.Object.registerSubclass('ChapterModel', ChapterModel);

module.exports = ChapterModel;
