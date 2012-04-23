var Api = require('./api.js'),
    Package = require('./package.js');

module.exports = {
  Api: Api,
  Package: Package,

  configure: function(config) {
    Api.configure(config);
    Package.configure(config);
    require('npm-lazy').configure(config);
  }
};
