var url = require('url'),

    Router = require('mixu_minimal').Router,
    Package = require('./package.js'),
    Impl = require('./impl.js'),
    Push = require('./push.js');

var api = new Router();

// full API, based on rewrites.js

// GET / => ../../../registry
// This should return the database info, like plain couchDB

// GET /-/jsonp/:jsonp => _list/short/listAll
// Call lists.js short(listAll)

// GET PUT POST DELETE HEAD _session
// User management
//
// POST /_session
// Log in; application/x-www-form-urlencoded encoding
// params: name and passowrd
// response { ok: true, name: foo, roles: [] }
//
// It looks like the expected cookie is called AuthSession=
//
// GET /_session
// Log in with a standard basic authorization header
//
// DELETE /_session
// Log out; unsets the session cookie

// GET /-/all/since => _list/index/modified
// Search - calls list.index(modified) -> returns index
api.get(new RegExp('^/-/all(.*)$'), Impl.list.index);

// GET /-/rss => _list/rss/modified
// RSS version of the modified index

// GET /-/all => _list/index/listAll
// GET /-/all/-/jsonp/:jsonp => _list/index/listAll
// list all, alternative version supports JSONP

// GET /-/short => _list/short/listAll
// array of the names of all packages

// GET /-/scripts => _list/scripts/scripts
// GET /-/by-field => _list/byField/byField
// GET /-/fields => _list/sortCount/fieldsInUse

// GET /-/needbuild => _list/needBuild/needBuild
// GET /-/prebuilt => _list/preBuilt/needBuild
// GET /-/nonlocal => _list/short/nonlocal

// GET /-/users => ../../../_users/_design/_auth/_list/index/listAll
// List of all users { "username": { name: "fullname", email: "email", "_conflicts": "junk" }

// PUT /-/user/:user => ../../../_users/:user
// Inserts user into the _users document, a builtin for CouchDB
/*
function () {
  'PUT'
    , '/-/user/org.couchdb.user:'+encodeURIComponent(username)
      { name : username
      , salt : salt
      , password_sha : sha(password + salt)
      , email : email
      , _id : 'org.couchdb.user:'+username
      , type : "user"
      , roles : []
      , date: new Date().toISOString()
      }
  // Return 409 if the user exists
}

// PUT /-/user/:user/-rev/:rev =>   ../../../_users/:user
// when updating, couchdb needs the latest rev
function () {

  'PUT'
                , '/-/user/org.couchdb.user:'+encodeURIComponent(username)
                  + "/-rev/" + userobj._rev
                , userobj

}

// GET /-/user/:user => ../../../_users/:user
function () {
  '/-/user/org.couchdb.user:'+encodeURIComponent(username)
}
*/

// GET /-/user-by-email/:email => ../../../_users/_design/_auth/_list/email/listAll
// fetch user by email ["username"]

// GET /-/top => _view/npmTop
// not working?

// GET /-/by-user/:user => _list/byUser/byUser
// GET /-/starred-by-user/:user => _list/byUser/starredByUser
// GET /-/starred-by-package/:user => _list/byUser/starredByPackage

// GET /:pkg => /_show/package/:pkg
api.get(new RegExp('^/([^/]+)$'), Impl.show.package);

// GET /:pkg/-/jsonp => /_show/package/:pkg
// GET /:pkg/:version/:jsonp => _show/package/:pkg (GET /package/version)
api.get(new RegExp('^/(.+)/(.+)$'), function(req, res, match) {
  Package.get(match[1], match[2], function(err, data) {
    if(err) throw err;
    res.end(JSON.stringify(data));
  });
});

// GET /:pkg/:version/-/jsonp/:jsonp => _show/package/:pkg

// GET "/:pkg/-/:att", to: "../../:pkg/:att (GET /package/-/package-version.tgz)
api.get(new RegExp('^/(.+)/-/(.+)$'), function(req, res, match) {
  Package.getTar(match[1], match[2], res);
});

// PUT "/:pkg/-/:att/:rev", to: "../../:pkg/:att
// PUT "/:pkg/-/:att/-rev/:rev", to: "../../:pkg/:att", method: "PUT" }
// DELETE "/:pkg/-/:att/:rev", to: "../../:pkg/:att
// DELETE "/:pkg/-/:att/-rev/:rev", to: "../../:pkg/:att

// PUT "/:pkg", to: "/_update/package/:pkg (PUT /packagename { wrangled package.json })
// create the package
api.put(new RegExp('^/([^/]+)$'), api.parse(Impl.create.package));
// Return 409 if the package exists

// PUT "/:pkg/-rev/:rev", to: "/_update/package/:pkg
// update the package (-rev should match latest?)
// PUT "/:pkg/:version", to: "_update/package/:pkg
// PUT  "/:pkg/:version/-rev/:rev", to: "_update/package/:pkg (PUT /requireincontext/-/requireincontext-0.0.2.tgz/-rev/5-988ff7c27a21e527ceeb50cbedc8d1b0)
// send a binary package
api.put(new RegExp('^/([^/]+)/-/([^/]+)/-rev/([^/]+)$'), Impl.create.binary);


// PUT "/:pkg/:version/-tag/:tag", to: "_update/package/:pkg (PUT /requireincontext/0.0.2/-tag/latest)
// add a new version to the package
api.put(new RegExp('^/([^/]+)/([^/]+)/-tag/([^/]+)$'), api.parse(Impl.package.addversion));

// PUT "/:pkg/:version/-tag/:tag/-rev/:rev", to: "_update/package/:pkg
// PUT "/:pkg/:version/-pre/:pre", to: "_update/package/:pkg
// PUT "/:pkg/:version/-pre/:pre/-rev/:rev", to: "_update/package/:pkg

// DELETE "/:pkg/-rev/:rev", to: "../../:pkg"
// Unpublish a package (all versions)

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

// Create workflow:

// PUT /packagename { wrangled package.json } --> This is intended to create a new package
// GET /packagename
// check that the version we are pushing is newer than before
// PUT /requireincontext/0.0.2/-tag/latest --> This contains a full new version
// {"name":"requireincontext","description":"Wrapper to require() js files in a custom context","version":"0.0.2","author":{"name":"Mikito Takada","email":"mixu@mixu.net"},"keywords":["require"],"repository":{"type":"git","url":"git://github.com/mixu/require2incontext.git"},"main":"index.js","_npmUser":{"name":"mixu","email":"mixu@mixu.net"},"_id":"requireincontext@0.0.2","dependencies":{},"devDependencies":{},"optionalDependencies":{},"engines":{"node":"*"},"_engineSupported":true,"_npmVersion":"1.1.18","_nodeVersion":"v0.6.7","_defaultsLoaded":true,"dist":{"shasum":"742d3bce1cb0bea1ce8fca90b867281c42627f82","tarball":"http://localhost:8080/requireincontext/-/requireincontext-0.0.2.tgz"},"readme":""}
// GET /requireincontext
// check something?
// PUT /requireincontext/-/requireincontext-0.0.2.tgz/-rev/5-988ff7c27a21e527ceeb50cbedc8d1b0

module.exports = api;
