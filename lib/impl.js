var Package = require('./package.js'),
    Push = require('./push.js');

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

exports.list = {};

exports.list.index = function(req, res, match) {
  res.end(JSON.stringify({
    _updated: Math.floor(new Date().getTime() / 1000),
    testfoo: {
      "_id":"testfoo",
      "name":"testfoo",
      "description":"Test hello world",
      "dist-tags":{"latest":"0.0.2"},
      // ADDED
      "keywords":["test"],
      "url": "http://registry.npmjs.org/mustache-wax/",
      // end added
      "versions":{
        "0.0.1":{
          "name":"testfoo",
          "description":"Test hello world",
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
        "readme":"asdasdad",
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
};

exports.show = {};

exports.show.package = function(req, res, match) {
  var pkgName = match[1];
  Package.get(pkgName, function(err, data) {
    if(err) throw err;
    console.log(data)
    res.end(JSON.stringify(data));
  });
};

exports.create = {};

exports.create.package = function(req, res, match, data) {
  console.log('PUT', match);
  var pkgName = match[1];
  if(Package.exists(pkgName)) {
    res.statusCode = 403;
    return res.end(JSON.stringify({ forbidden: 'Package must exist' }));
  } else {
    console.log(data);
    return Push.create(pkgName, JSON.parse(data), ender(res, 'created new entry'));
  }
};

exports.create.binary = function(req, res, match) {
  var pkgName = match[1],
      fileName = match[2],
      revision = match[3];
  Push.storeFile(pkgName, req, res, fileName, revision, ender(res, 'wrote file' + fileName));
};

exports.package = {};

exports.package.addversion = function(req, res, match, data) {
  var pkgName = match[1],
      version = match[2],
      tagName = match[3];
  if(Package.exists(pkgName)) {
    return Push.addVersion(pkgName, version, JSON.parse(data), ender(res, 'added version'));
  } else {
    console.log(data);
    return Push.create(pkgName, JSON.parse(data), ender(res, 'created new entry'));
  }
};
