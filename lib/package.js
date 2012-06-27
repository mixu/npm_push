var fs = require('fs'),
    url = require('url'),
    path = require('path'),

    semver = require('semver');

// configuration
var Cache, // Cache instance
    externalUrl; // external URL of the registry

function Package() { }

Package.configure = function(config) {
  Cache = config.cache;
  externalUrl = config.externalUrl;
};

Package.exists = function(name) {
  return Cache.has(name, 'index.json');
};

Package.get = function(name, version, callback) {
  // version is optional
  if(arguments.length == 2) {
    callback = version;
    return Package._getIndex(name, callback);
  } else {
    return Package._getVersion(name, version, callback);
  }
};

Package._getIndex = function(name, callback) {
  Cache.get(name, 'index.json', function(err, doc) {
    return callback(err,
      Package._rewriteLocation(
        JSON.parse(doc.toString())
      ));
  });
};

Package._getVersion = function(name, version, callback) {
  var filename = name +'/index.json';
  // according to the NPM source, the version specific JSON is
  // directly from the index document (e.g. just take doc.versions[ver])
  Cache.get(name, 'index.json', function(err, doc) {
    if(err) throw err;
    doc = JSON.parse(doc.toString());

    // from NPM: if not a valid version, then treat as a tag.
    if (!(version in doc.versions) && (version in doc['dist-tags'])) {
      version = doc['dist-tags'][version]
    }
    if(doc.versions[version]) {
      return callback(undefined, Package._rewriteLocation(doc.versions[version]));
    }
    throw new Error('[done] Could not find version', filename, version);
    return callback(undefined, {});
  });
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
  // add a junk _rev for npm
  doc['_rev'] = 'junk-'+new Date().getTime();
  // write to file
  return Cache.addIndex(name, doc, callback);
};

// add a new version to a package
Package.addVersion = function(name, version, json, callback) {
  // must be valid
  if(!semver.valid(version)) {
    // this is where the tag update code would go
    return callback('invalid version: '+ version);
  }
  Cache.getIndex(name, function(err, doc) {
    var isValidVersion = semver.valid(version),
        isExistingVersion = !!((version in doc.versions) || (semver.clean(version) in doc.versions)),
        isValidName = Package.validName(json.name),
        isSameName = !!(json.version == semver.clean(version));

    if(!isValidVersion) {
      return callback('invalid version: '+JSON.stringify(version));
    }
    if(isExistingVersion) {
      return callback('cannot modify existing version');
    }
    if(!isValidName) {
      return callback('Invalid name: '+JSON.stringify(json.name));
    }
    if(!isSameName) {
      return callback('version in doc doesn\'t match version in request: '
                    + JSON.stringify(json.version)
                    + " !== " + JSON.stringify(version));
    }
    // fill in defaults
    json._id = json.name + "@" + json.version;
    if (json.description) doc.description = json.description;
    if (json.author) doc.author = json.author;
    if (json.repository) doc.repository = json.repository;
    json.maintainers = doc.maintainers;
    // set the tag and time
    var tag = (json.publishConfig && json.publishConfig.tag) || json.tag || "latest";
    doc["dist-tags"][tag] = json.version;

    doc.versions[version] = json;
    doc.time = doc.time || {};
    doc.time[version] = (new Date()).toISOString();
    doc['_rev'] = 'junk-'+new Date().getTime();
    // save the document
    return Cache.addIndex(name, doc, callback);
  });
};

// update the metadata on the latest package version
Package.updateLatest = function(name, version, json, callback) {
  // update the latest package document revision
  var changed = false;
  Cache.getIndex(name, function(err, doc) {
    if (doc._rev && doc._rev !== json._rev) {
      return callback('must supply latest _rev to update existing package');
    }
    if (json.url && (json.versions || json["dist-tags"])) {
      return callback('Do not supply versions or dist-tags for packages hosted elsewhere. Just a URL is sufficient.');
    }
    for (var i in json) {
      if (typeof json[i] === "string" || i === "maintainers") {
        doc[i] = json[i];
      }
    }
    if (json.versions) {
      doc.versions = json.versions;
    }
    if (json["dist-tags"]) {
      doc["dist-tags"] = json["dist-tags"];
    }
    if (json.users) {
      if (!doc.users) {
        doc.users = {};
      }
      // doc.users[req.userCtx.name] = json.users[req.userCtx.name]
    }
    // add a junk _rev for npm
    doc['_rev'] = 'junk-'+new Date().getTime();
    return Cache.addIndex(name, doc, callback);
  });
};

// store a tar file
Package.storeFile = function(name, req, res, filename, revision, callback) {
  var localName = config.cacheDirectory + name + '/'+ filename;
  req.on('end', callback);
  req.pipe(fs.createWriteStream(localName));
};

Package._rewriteLocation = function(meta) {
  if(!meta) {
    return meta;
  }

  if(meta.versions) {
    // if a full index, apply to all versions
    Object.keys(meta.versions).forEach(function(version) {
      meta.versions[version] = Package._rewriteLocation(meta.versions[version]);
    });
  }

  if (meta.dist && meta.dist.tarball) {
    var parts = url.parse(meta.dist.tarball);
    meta.dist.tarball = externalUrl+parts.pathname;
  }
  return meta;
};

Package.checkFile = function(filename, cb) {
  // from npm:
  var crypto = require('crypto');
  var h = crypto.createHash("sha1"),
      s = fs.createReadStream(filename),
      errState = null;
  s.on("error", function (er) {
    if (errState) return;
    return cb(errState = er)
  }).on("data", function (chunk) {
    if (errState) return;
    h.update(chunk);
  }).on("end", function () {
    if (errState) return
    var actual = h.digest("hex").toLowerCase().trim();
    cb(null, actual);
  });
};

Package.getTar = function(name, filename, res) {
  Cache.respondTar(name, filename, res);
};

// from NPM
Package.validName = function validName (name) {
 if (!name) return false
 var n = name.replace(/^\s|\s$/, "")
 if (!n || n.charAt(0) === "."
     || n.match(/[\/\(\)&\?#\|<>@:%\s\\]/)
     || n.toLowerCase() === "node_modules"
     || n.toLowerCase() === "favicon.ico") {
   return false
 }
 return n
};

module.exports = Package;
