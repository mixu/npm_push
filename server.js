var http = require('http'),
    app = require('./lib/app.js'),
    api;


app.configure(require('./config.js'));

var api = app.Api,
    server = http.createServer();

server.on('request', function(req, res) {
  if(!api.route(req, res)) {
    console.log('No route found', req.url);
    res.end();
  }
}).listen(8080, 'localhost');

