var http = require('http'),
    api = require('./lib/api.js'),
    config = require('./config.js');

var server = http.createServer();

server.on('request', function(req, res) {
  if(!api.route(req, res)) {
    console.log('No route found', req.url);
    res.end();
  }
}).listen(config.port, config.host);
