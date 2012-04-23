var fs = require('fs'),
    url = require('url'),

    Cache = require('npm-lazy').Cache,
    config;

function Package() { }

Package.configure = function(configuration) {
  config = configuration;
};

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
  return Cache.addIndex(name, doc, callback);
};

// add a new version to a package
Package.addVersion = function(name, version, callback) {
  // must be valid
  if(!semver.valid(version)) {
    // this is where the tag update code would go
    return callback('invalid version: '+ version);
  }
  Cache.getIndex(name, function(err, doc) {
    // must not be an existing version
    // must have a valid name
    // must match the version in the body
    // fill in defaults
    // set the tag and time


    // save the document
    // return a 200 'added version'

  });
};

// update the metadata on the latest package version
Package.updateLatest = function(name, version, json, callback) {
  // update the latest package document revision
};

// store a tar file
Package.storeFile = function(name, req, res, filename, revision, callback) {
  var localName = config.cacheDirectory + name + '/'+ filename;
  req.on('end', callback);
  req.pipe(fs.createWriteStream(localName));
};

Package.getIndex = function(name, callback) {
  // check for cache hit
  if(Cache.hasIndex(name)) {
    Cache.getIndex(name, callback);
  } else {
    Cache.fetchIndex(name, callback);
  }
};

Package.getVersion = function(name, version, callback) {
  // according to the NPM source, the version specific JSON is
  // directly from the index document (e.g. just take doc.versions[ver])
  Package.getAll(name, function(err, doc) {
    if(err) throw err;

    // from NPM: if not a valid version, then treat as a tag.
    if (!(version in doc.versions) && (version in doc['dist-tags'])) {
      version = doc['dist-tags'][version]
    }
    if(doc.versions[version]) {
      return callback(undefined, doc.versions[version]);
    }
    throw new Error('[done] Could not find version', name, version);
    return callback(undefined, {});
  });
};

Package.rewriteLocation = function(meta) {
  if(meta.versions) {
    // if a full index, apply to all versions
    Object.keys(meta.versions).forEach(function(version) {
      meta.versions[version] = Package.rewriteLocation(meta.versions[version]);
    });
  }

  if (meta.dist && meta.dist.tarball) {
    var parts = url.parse(meta.dist.tarball);
    meta.dist.tarball = config.externalUrl+parts.pathname;
  }
  return meta;
};

Package.getTar = function(name, filename, res) {
  Cache.respondTar(name, filename, res);
};

module.exports = Package;
