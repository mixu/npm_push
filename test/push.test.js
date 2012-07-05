var fs = require('fs'),
    util = require('util'),
    http = require('http'),
    path = require('path'),
    assert = require('assert'),

    npm = require('npm'),
    Router = require('mixu_minimal').Router,

    api =  require('../lib/api.js'),
    Package = require('../lib/package.js'),
    Push = require('../lib/push.js');

exports['given a push endpoint'] = {

  before: function(done) {
    var Cache = require('../lib/cache.js');
    Cache.configure({ cacheDirectory: __dirname+'/db/'});
    Package.configure({
      cache: Cache,
      externalUrl: 'http://localhost:9090'
    });
    Push.configure({
      cache: Cache,
      cacheDirectory: __dirname+'/db/'
    });


    this.server = http.createServer(function(req, res) {
      api.route(req, res);
    });
    this.server.listen(9090, 'localhost', function() {
      done();
    });
  },

  // PUSH tests
  // npm push foo
  'can push a package to the cache': function(done) {
    this.timeout(10000);
    npm.load({ registry: 'http://localhost:9090/'}, function (err) {
      if (err) { throw new Error(err); }
      npm.commands.publish(['./fixture/'], function (err, data) {
        if (err) { throw new Error(err); }
        done();
      })
    });
  }

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
