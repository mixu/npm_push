var fs = require('fs'),
    semver = require('semver'),

    Package = require('./package.js');

// configuration
var Cache, // Cache instance
    basePath; // path to cache directory

exports.configure = function(config) {
  Cache = config.cache;
  basePath = config.cacheDirectory;
};

// create a new package
exports.create = function(name, json, callback) {
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
  return Cache.add(name, 'index.json', JSON.stringify(doc), callback);
};

// add a new version to a package
exports.addVersion = function(name, version, json, callback) {
  // must be valid
  if(!semver.valid(version)) {
    // this is where the tag update code would go
    return callback('invalid version: '+ version);
  }
  Cache.get(name, 'index.json', function(err, doc) {
    doc = JSON.parse(doc.toString());
    var isValidVersion = semver.valid(version),
        isExistingVersion = !!((version in doc.versions) || (semver.clean(version) in doc.versions)),
        isValidName = exports.validName(json.name),
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
    return Cache.add(name, 'index.json', JSON.stringify(doc), callback);
  });
};

// update the metadata on the latest package version
exports.updateLatest = function(name, version, json, callback) {
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
exports.storeFile = function(name, req, res, filename, revision, callback) {
  var localName = basePath + name + '/'+ filename;
  req.on('end', callback);
  req.pipe(fs.createWriteStream(localName));
};

exports.getTar = function(name, filename, res) {
  Cache.respondTar(name, filename, res);
};

// from NPM
exports.validName = function validName (name) {
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
