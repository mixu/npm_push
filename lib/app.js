var Api = require('./api.js');

module.exports = {
  Api: Api,

  configure: function(config) {
    Api.configure(config);
    require('npm-lazy').configure(config);
  }
};
