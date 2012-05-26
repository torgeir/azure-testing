var uuid = require('node-uuid');
var http = require('http');

var app = require('./app');

var server = app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
