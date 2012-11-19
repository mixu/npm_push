var fs = require('fs'),
    util = require('util'),
    http = require('http'),
    path = require('path'),
    assert = require('assert'),

    npm = require('npm'),
    rimraf = require('rimraf'),
    Router = require('mixu_minimal').Router,
    Client = require('mixu_minimal').Client,

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
      rimraf(__dirname+'/db/testfoo', function() {
        done();
      })
    });
  },

  // npm push foo, where the package does not exist
  'can push a new package to the cache': function(done) {
    this.timeout(10000);
    npm.load({ registry: 'http://localhost:9090/',
      email : 'foo@bar.com',
      _auth : 'foobar',
      _token  : 'footoken',
      username : 'foouser'
    }, function (err) {
      if (err) { throw new Error(err); }
      npm.commands.publish([__dirname + '/fixture/0.0.1'], function (err, data) {
        if (err) { throw new Error(err); }
        done();
      })
    });
  },

  // npm view testfoo
  'can npm view': function(done) {
    npm.load({ registry: 'http://localhost:9090/'}, function (err) {
      if (err) { throw new Error(err); }
      npm.commands.view(['testfoo'], function (err, data) {
        if (err) { throw new Error(err); }
        assert.ok(data['0.0.1']);
        data = data['0.0.1'];
        console.log(util.inspect(data, false, 5, true));
        assert.equal(data.name, 'testfoo');
        assert.equal(data.version, '0.0.1');
        assert.equal(data['dist-tags'].latest, '0.0.1');
        done();
      })
    });
  },

  // npm install testfoo


  // npm push foo, where the package exists and is a new version
  'can push a updated version of a package to the cache': function(done) {
    this.timeout(10000);
    npm.load({ registry: 'http://localhost:9090/'}, function (err) {
      if (err) { throw new Error(err); }
      npm.commands.publish(['./fixture/0.0.2'], function (err, data) {
        if (err) { throw new Error(err); }
        Client
          .get('http://localhost:9090/testfoo')
          .end(Client.parse(function(err, data) {
            data = JSON.parse(data);
            assert.equal(data.name, 'testfoo');
            assert.equal(data['dist-tags'].latest, '0.0.2');
            done();
          }));
      })
    });
  },

  // npm search testfoo
  'can npm search': function(done) {
    this.timeout(10000);
    npm.load({ registry: 'http://localhost:9090/'}, function (err) {
      if (err) { throw new Error(err); }
      npm.commands.search(['testfoo'], function (err, data) {
        if (err) { throw new Error(err); }
        console.log(data);
        done();
      })
    });
  },


};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
