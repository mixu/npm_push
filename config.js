var path = require('path');

module.exports = {
  // directory to store cached packages (full path)
  cacheDirectory: path.normalize(__dirname+'/db/'),
  // maximum age before an index is refreshed from npm
  cacheAge: 60 * 60 * 1000,
  // external url to npm-lazy, no trailing /
  externalUrl: 'http://localhost:8080',
  // bind port and host
  port: 8080,
  host: 'localhost',
  // external registries in resolve order
  searchPath: [
    {
      // subdirectory in cacheDirectory for caching/storage
      dir: 'local'
      // no url = this is the local repository
    },
    {
      // subdirectory in cacheDirectory for caching
      dir: 'remote',
      // url to registry
      url: 'http://registry.npmjs.org/'
    }
  ]
};
