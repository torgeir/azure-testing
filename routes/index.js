
/*
 * GET home page.
 */
var Geek = require('../geek');

module.exports = function (app) {

  var events = new require('events');
  var hub = new events.EventEmitter();

  app.get('/', function (req, res) {
    res.redirect('/geek');
  });

  app.get('/geek', function index (req, res){

    Geek.all(function (err, geeks) {
      res.send(geeks);
    });
  });

  app.post('/geek', function create (req, res) {
    var name = req.body.name;
    Geek.save({ name: name }, function (err, geek) {

      res.send(geek);

      Geek.all(function (err, geeks) {
        hub.emit('geek', 'Created geek ' + geek.name + ', now ' + geeks.length + ' geeks at your service!!1');
      });
    });
  });

  app.del('/geek/:id', function del(req, res) {
    var id = req.params.id;
    Geek.del(req.params.id, function (err, ok) {

      res.end();

      Geek.all(function (err, geeks) {
        hub.emit('geek', 'Deleted geek, now only ' + geeks.length + ' geeks remain!!');
      });
    });
  });

  app.get('/geek/stream', function stream (req, res) {
    res.writeHead(200, { 'transfer-encoding': 'chunked' });
    hub.on('geek', function (msg) {
      res.write(msg + '\n');
    });
  });

};
