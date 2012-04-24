var fs = require('fs'),
    http = require('http'),
    assert = require('assert'),
    npm = require('npm'),

    api = require('../lib/app.js').Api;

require('../lib/app.js').configure(require('../config.js'));

exports['given a server'] = {

  before: function(done) {
    this.server = http.createServer(function(req, res) {
      api.route(req, res);
    });
    this.server.listen(9090, 'localhost', function() {
      done();
    });
  },

  // npm install foo
  'can install a package from the cache': function(done) {
    npm.load({ registry: 'http://localhost:9090/'}, function (err) {
      if (err) {
        throw new Error(err);
      }
      npm.commands.install(["requireincontext"], function (err, data) {
        if (err) {
          throw new Error(err);
        }
        done();
      })
    });
  },

  // npm push foo
  'can push a package to the cache': function(done) {
    this.timeout(10000);
    npm.load({ registry: 'http://localhost:9090/'}, function (err) {
      if (err) {
        throw new Error(err);
      }
      npm.commands.publish(['./fixture/'], function (err, data) {
        if (err) {
          throw new Error(err);
        }
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
