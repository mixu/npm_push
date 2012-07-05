var url = require('url'),

    Router = require('mixu_minimal').Router,
    Package = require('./package.js'),
    Push = require('./push.js'),

    config;

var api = new Router();

api.configure = function(configuration) {
  config = configuration;
};

function ender(res, success) {
  return function(err) {
    if(err) {
      res.statusCode = 403;
      return res.end(JSON.stringify({ forbidden: err }));
    }
    console.log(success);
    res.end(JSON.stringify({ ok: success }));
  };
}

// Search
// /-/all/since -> returns index
api.get(new RegExp('^/-/all(.*)$'), function(req, res, match) {
  res.end(JSON.stringify({
    _updated: Math.floor(new Date().getTime() / 1000),
    testfoo: {
      "_id":"testfoo",
      "name":"testfoo",
      "description":"Test",
      "dist-tags":{"latest":"0.0.2"},
      // ADDED
      "keywords":["test"],
      "url": "http://registry.npmjs.org/mustache-wax/",
      // end added
      "versions":{
        "0.0.1":{
          "name":"testfoo",
          "description":"Test",
          "version":"0.0.1",
          "author":{"name":"Mikito Takada","email":"mixu@mixu.net"},
          "keywords":["test"],
          "main":"index.js",
          "publishConfig":{"registry":"http://localhost:9090/"},
          "_id":"testfoo@0.0.1",
          "dist":{"shasum":"63d1a0cfeca34e126e6430812aa15174e6046435","tarball":"http://localhost:9090/testfoo/-/testfoo-0.0.1.tgz"},
          "readme":"",
          "maintainers":[{"name":"mixu","email":"mixu@mixu.net"}]},
        "0.0.2":{
          "name":"testfoo","description":"Test","version":"0.0.2","author":{"name":"Mikito Takada","email":"mixu@mixu.net"},"keywords":["test"],"main":"index.js","publishConfig":{"registry":"http://localhost:9090/"},"_id":"testfoo@0.0.2","dist":{"shasum":"2e0d10ee5f59b8667b1d4a9a1337518cb8fbf065","tarball":"http://localhost:9090/testfoo/-/testfoo-0.0.2.tgz"},"readme":"",
          "maintainers":[{"name":"mixu","email":"mixu@mixu.net"}]}
        },
        "readme":"",
        "maintainers":[{"name":"mixu","email":"mixu@mixu.net"}],
        "_rev":"junk-1341531207790",
        "author":{"name":"Mikito Takada","email":"mixu@mixu.net"},
        "time":{
          // ADDED
          "modified": "2012-07-05T23:42:10.237Z",
          "created": "2012-07-05T23:42:09.093Z",
          // end added
          "0.0.1":"2012-07-05T23:33:27.699Z",
          "0.0.2":"2012-07-05T23:33:27.790Z"
        }
      }
  }))
});

// GET /package
api.get(new RegExp('^/([^/]+)$'), function(req, res, match) {
  var pkgName = match[1];
  Package.get(pkgName, function(err, data) {
    if(err) throw err;
    console.log(data)
    res.end(JSON.stringify(data));
  });
});

// GET /package/-/package-version.tgz
api.get(new RegExp('^/(.+)/-/(.+)$'), function(req, res, match) {
  Package.getTar(match[1], match[2], res);
});

// GET /package/version
api.get(new RegExp('^/(.+)/(.+)$'), function(req, res, match) {
  Package.get(match[1], match[2], function(err, data) {
    if(err) throw err;
    res.end(JSON.stringify(data));
  });
})

// Create workflow:

// PUT /packagename { wrangled package.json } --> This is intended to create a new package
// GET /packagename
// check that the version we are pushing is newer than before
// PUT /requireincontext/0.0.2/-tag/latest --> This contains a full new version
// {"name":"requireincontext","description":"Wrapper to require() js files in a custom context","version":"0.0.2","author":{"name":"Mikito Takada","email":"mixu@mixu.net"},"keywords":["require"],"repository":{"type":"git","url":"git://github.com/mixu/require2incontext.git"},"main":"index.js","_npmUser":{"name":"mixu","email":"mixu@mixu.net"},"_id":"requireincontext@0.0.2","dependencies":{},"devDependencies":{},"optionalDependencies":{},"engines":{"node":"*"},"_engineSupported":true,"_npmVersion":"1.1.18","_nodeVersion":"v0.6.7","_defaultsLoaded":true,"dist":{"shasum":"742d3bce1cb0bea1ce8fca90b867281c42627f82","tarball":"http://localhost:8080/requireincontext/-/requireincontext-0.0.2.tgz"},"readme":""}
// GET /requireincontext
// check something?
// PUT /requireincontext/-/requireincontext-0.0.2.tgz/-rev/5-988ff7c27a21e527ceeb50cbedc8d1b0

// PUT /packagename { wrangled package.json }
// create the package
api.put(new RegExp('^/([^/]+)$'), api.parse(function(req, res, match, data) {
  console.log('PUT', match);
  var pkgName = match[1];
  if(Package.exists(pkgName)) {
    res.statusCode = 403;
    return res.end(JSON.stringify({ forbidden: 'Package must exist' }));
  } else {
    console.log(data);
    return Push.create(pkgName, JSON.parse(data), ender(res, 'created new entry'));
  }
}));

// PUT /requireincontext/0.0.2/-tag/latest
// add a new version to the package
api.put(new RegExp('^/([^/]+)/([^/]+)/-tag/([^/]+)$'), api.parse(function(req, res, match, data) {
  var pkgName = match[1],
      version = match[2],
      tagName = match[3];
  if(Package.exists(pkgName)) {
    return Push.addVersion(pkgName, version, JSON.parse(data), ender(res, 'added version'));
  } else {
    console.log(data);
    return Push.create(pkgName, JSON.parse(data), ender(res, 'created new entry'));
  }
}));

// PUT /requireincontext/-/requireincontext-0.0.2.tgz/-rev/5-988ff7c27a21e527ceeb50cbedc8d1b0
// send a binary package
api.put(new RegExp('^/([^/]+)/-/([^/]+)/-rev/([^/]+)$'), function(req, res, match) {
  var pkgName = match[1],
      fileName = match[2],
      revision = match[3];
  Push.storeFile(pkgName, req, res, fileName, revision, ender(res, 'wrote file' + fileName));
});


module.exports = api;
