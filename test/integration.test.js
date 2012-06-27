var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    assert = require('assert'),
    npm = require('npm'),

    api = require('../lib/app.js').Api;

var config = {
  // directory to store cached packages (full path)
  cacheDirectory: path.normalize(__dirname+'/../db/'),
  // maximum age before an index is refreshed from npm
  cacheAge: 60 * 60 * 1000,
  // external url to npm-lazy, no trailing /
  externalUrl: 'http://localhost:9090',
  // bind port and host
  port: 9090,
  host: 'localhost',
  // external registries in resolve order
  searchPath: [
    {
      // subdirectory in cacheDirectory for caching/storage
      dir: 'local'
      // no url = this is the local repository
    },
    {
      // subdirectory in cacheDirectory for caching
      dir: 'remote',
      // url to registry
      url: 'http://registry.npmjs.org/'
    }
  ]
};


config.externalUrl = 'http://localhost:9090';

require('../lib/app.js').configure(config);

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
    this.timeout(100000);
    npm.load({ registry: 'http://localhost:9090/'}, function (err) {
      if (err) { throw new Error(err); }
      npm.commands.install(["requireincontext"], function (err, data) {
        if (err) { throw new Error(err); }
        done();
      })
    });
  },

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
