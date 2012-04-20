function Package() { }

Package.exists = function(name) {
  return false;
};

// create a new package
Package.create = function(name, json, callback) {
  var doc = json;
  // ported from NPM
  if(!doc._id) doc._id = doc.name;
  if(doc.url) {
    console.log('The URLs as dependencies feature is not supported by npm-push.');
    res.end();
  }
  if (!doc.versions) doc.versions = {};
  if (!doc['dist-tags']) doc['dist-tags'] = {};
  // write to file
  return callback();
};

// add a new version to a package
Package.addVersion = function(name, version, callback) {
  // must be valid
  if(!semver.valid(version)) {
    return callback('invalid version: '+ version);
  }
  // must not be an existing version
  // must have a valid name
  // must match the version in the body
  // fill in defaults
  // set the tag and time
  // save the document
  // return a 200 'added version'
};

// update the metadata on the latest package version
Package.updateLatest = function(name, version, json, callback) {
  // update the latest package document revision
};

// store a tar file
Package.storeFile = function(name, filename, revision, data, callback) {

};

Package.getIndex = function(name, callback) {
  callback(undefined, JSON.stringify({
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
};

module.exports = Package;
