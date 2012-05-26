var config = require('./config');
var azure = require('azure');
var uuid = require('node-uuid');


/**
 * instance methods
 */
var Geek = module.exports = function Geek (doc) {
  this.doc = doc;
};

Geek.prototype.__defineGetter__('name', function () {
  return this.doc.name;
});

Geek.prototype.__defineSetter__('name', function (value) {
  this.doc.name = value;
});

Geek.prototype.save = function (f) {
  console.log('saving ', this.doc);
  Geek.save(this.doc, f);
};

/**
 * static methods
 */
Geek.del = function (id, f) {
  var client = Geek.client;

  var item = {
    PartitionKey: config.PARTITION,
    RowKey: id
  };

  client.deleteEntity(config.TABLE_NAME, item, function (err) {
    if (err) {
      f(err);
    }
    else {
      f(null, 'ok');
    }
  });
};

Geek.save = function (doc, f) {
  var client = Geek.client;

  client.createTableIfNotExists(config.TABLE_NAME, function createTableIfNotExists (err, createdOrExists, response) {
    if (err) {
      return f(err, null);
    }
   
    var item = {
      PartitionKey: config.PARTITION,
      RowKey:       doc.RowKey || uuid(),
      name:         doc.name
    };

    var exists = doc.RowKey;
    client[ !exists ? 'insertEntity' : 'updateEntity' ](config.TABLE_NAME, item, function (err, doc, response) {
      if (err) {
        return err;
      }
      else {
        f(null, doc);
      }
    });
  });
};


Geek.client = azure.createTableService(config.NAME, config.KEY);

Geek.all = function (f) {
  var query = azure.TableQuery
      .select()
      .from(config.TABLE_NAME)
      .where('PartitionKey eq ?', config.PARTITION);

  Geek.client.queryEntities(query, function (err, docs) {
    if (err) {
      f(err, null);
    }
    else {
      var geeks = docs.map(function (doc) { return new Geek(doc); });
      f(null, geeks);
    }
  });
};
