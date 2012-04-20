var url = require('url'),

    Router = require('./router.js'),
    Package = require('./package.js');

var api = new Router();

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

function updatePackage(req, res, pkgName, version, revision, data) {
  if(Package.exists(pkgName)) {
    // if pushing specific version?
    if(version) {
      return Package.addVersion(pkgName, version, ender(res, 'added version'));
    }
    return Package.updateLatest(pkgName, version, data, ender(res, 'updated package metadata'));
  } else {
    console.log(data);
    Package.create(pkgName, JSON.parse(data), ender(res, 'created new entry'));
  }
  res.end();
}

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
api.put(new RegExp('^/([^/]+)$'), function(req, res, match, data) {
  console.log('PUT', match);
  var pkgName = match[1];
  updatePackage(req, res, pkgName, null, null, data);
});

// PUT /requireincontext/0.0.2/-tag/latest
// add a new version to the package
api.put(new RegExp('^/([^/]+)/([^/]+)/-tag/([^/]+)$'), function(req, res, match, data) {
  var pkgName = match[1],
      version = match[2];
      tagName = match[3];
  updatePackage(req, res, pkgName, null, null, data);
});


// PUT /requireincontext/-/requireincontext-0.0.2.tgz/-rev/5-988ff7c27a21e527ceeb50cbedc8d1b0
// send a binary package
api.put(new RegExp('^/([^/]+)/-/([^/]+)/-rev/([^/]+)$'),  function(req, res, match, data) {
  var pkgName = match[1],
      fileName = match[2],
      revision = match[3];
  Package.storeFile(pkgName, fileName, revision, data, ender(res, 'wrote file' + fileName));
});

// GET /package
api.get(new RegExp('^/([^/]+)$'), function(req, res, match) {
  var pkgName = match[1];
  Package.getIndex(pkgName, function(err, data) {
    res.end(data);
  }));
});

module.exports = api;
