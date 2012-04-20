var http = require('http'),
    api = require('./lib/server');


var server = http.createServer();

server.on('request', function(req, res) {
  if(!api.route(req, res)) {
    console.log('No route found', req.url);
    res.end();
  }
}).listen(8080, 'localhost');

