var url = require('url'),

    Router = require('./router.js');

var Cache = {
  exists: function(pkg) { return false; }
};

var Package = {

create: function(pkgName, doc, res) {
  // ported from NPM
  if(!doc._id) doc._id = doc.name;
  if(doc.url) {
    console.log('The URLs as dependencies feature is not supported by npm-push.');
    res.end();
  }
  if (!doc.versions) doc.versions = {};
  if (!doc['dist-tags']) doc['dist-tags'] = {};
  // write to file
  res.end(JSON.stringify({ ok: 'created new entry' }));
},

update: function(pkgname, version, data, res) {
  // read the document

  // if pushing specific version?
  if(version) {
    return Package.addVersion(version, res);
  }
  return Package.updateLatest(data, res);
},

addVersion: function(version, res) {
  // must be valid
  if(!semver.valid(version)) {
    res.statusCode = 403;
    return res.end(JSON.stringify({ forbidden: 'invalid version: '+ version }));
  }
  // must not be an existing version
  // must have a valid name
  // must match the version in the body
  // fill in defaults
  // set the tag and time
  // save the document
  // return a 200 'added version'
},

updateLatest: function(data, res) {
  // update the latest package document revision
}
};

var api = new Router();

// Create workflow:

// PUT /packagename { wrangled package.json }
// GET /packagename
// check that the version we are pushing is newer than before
// PUT /requireincontext/0.0.2/-tag/latest
// {"name":"requireincontext","description":"Wrapper to require() js files in a custom context","version":"0.0.2","author":{"name":"Mikito Takada","email":"mixu@mixu.net"},"keywords":["require"],"repository":{"type":"git","url":"git://github.com/mixu/requireincontext.git"},"main":"index.js","_npmUser":{"name":"mixu","email":"mixu@mixu.net"},"_id":"requireincontext@0.0.2","dependencies":{},"devDependencies":{},"optionalDependencies":{},"engines":{"node":"*"},"_engineSupported":true,"_npmVersion":"1.1.18","_nodeVersion":"v0.6.7","_defaultsLoaded":true,"dist":{"shasum":"742d3bce1cb0bea1ce8fca90b867281c42627f82","tarball":"http://localhost:8080/requireincontext/-/requireincontext-0.0.2.tgz"},"readme":""}
// GET /requireincontext
// check something?
// PUT /requireincontext/-/requireincontext-0.0.2.tgz/-rev/5-988ff7c27a21e527ceeb50cbedc8d1b0

// PUT /packagename { wrangled package.json }
// create the package
api.put(new RegExp('^/([^/]+)$'), function(req, res, match, data) {
  console.log('PUT', match);
  var pkgName = match[1];

  if(Cache.exists(pkgName)) {
    // Package.update(pkgName, null, JSON.parse(data), res);
  } else {
    console.log(data);
    Package.create(pkgName, JSON.parse(data), res);
  }

  res.end();
});

// PUT /requireincontext/0.0.2/-tag/latest
// add a new version to the package
api.put(new RegExp('^/([^/]+)/([^/]+)/-tag/([^/]+)$'), function(req, res, match, data) {
  var pkgName = match[1],
      version = match[2];
      tagName = match[3];
  console.log('add a new version', pkgName, tagName);
  res.end();
});

// PUT /requireincontext/-/requireincontext-0.0.2.tgz/-rev/5-988ff7c27a21e527ceeb50cbedc8d1b0
// send a binary package
api.put(new RegExp('^/([^/]+)/-/([^/]+)/-rev/([^/]+)$'),  function(req, res, match, data) {
  var pkgName = match[1],
      tagName = match[2],
      revision = match[3];
  console.log('save a tarfile', pkgName, tagName, revision);
  res.end();
});

// GET /package
api.get(new RegExp('^/([^/]+)$'), function(req, res, match) {
  res.end(JSON.stringify({
  "_id": "requireincontext",
  "_rev": "5-988ff7c27a21e527ceeb50cbedc8d1b0",
  "name": "requireincontext",
  "description": "Wrapper to require() js files in a custom context",
  "dist-tags": {
    "latest": "0.0.1"
  },
  "versions": {
    "0.0.1": {
      "name": "requireincontext",
      "description": "Wrapper to require() js files in a custom context",
      "version": "0.0.1",
      "author": {
        "name": "Mikito Takada",
        "email": "mixu@mixu.net"
      },
      "keywords": [
        "require"
      ],
      "repository": {
        "type": "git",
        "url": "git://github.com/mixu/requireincontext.git"
      },
      "main": "index.js",
      "_npmJsonOpts": {
        "file": "/home/mtakada/.npm/requireincontext/0.0.1/package/package.json",
        "wscript": false,
        "contributors": false,
        "serverjs": false
      },
      "_id": "requireincontext@0.0.1",
      "dependencies": {},
      "devDependencies": {},
      "engines": {
        "node": "*"
      },
      "_engineSupported": true,
      "_npmVersion": "1.0.22",
      "_nodeVersion": "v0.4.11-pre",
      "_defaultsLoaded": true,
      "dist": {
        "shasum": "a47054a6e05bc7d6d7b7965fd0631ee58f4e72ef",
        "tarball": "http://registry.npmjs.org/requireincontext/-/requireincontext-0.0.1.tgz"
      },
      "scripts": {},
      "maintainers": [
        {
          "name": "mixu",
          "email": "mixu@mixu.net"
        }
      ],
      "directories": {}
    }

  },
  "maintainers": [
    {
      "name": "mixu",
      "email": "mixu@mixu.net"
    }
  ],
  "time": {
    "0.0.1": "2011-08-17T21:20:46.028Z"
  },
  "author": {
    "name": "Mikito Takada",
    "email": "mixu@mixu.net"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/mixu/requireincontext.git"
  }
}));
});

module.exports = api;
