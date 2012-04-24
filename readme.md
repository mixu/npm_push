# npm-push: a private npm server

I wanted a private server that is easy to deploy - e.g. one that uses regular files for storage (no CouchDB).

I wanted something that can cache npm packages locally, and that can accept pushes from npm locally.

## Configuration

    npm config set registry http://localhost:8080

    or

    npm --registry http://localhost:8080/ install foo

    or in package.json:

      "publishConfig":{
        "registry": "http://localhost:8080/"
      }


## Supported commands

Commands that work - remote:

    npm install
    npm publish
    npm view

Install and view are cached.
Publish does not go out to the main server.

Todo - remote:

    npm adduser
    npm deprecate <pkg>[@<version>] <message>
    npm outdated [<pkg> [<pkg> ...]]
    npm owner add <username> <pkg>
    npm owner rm <username> <pkg>
    npm owner ls <pkg>
    npm search
    npm star <package> [pkg, pkg, ...]
    npm unstar <package> [pkg, pkg, ...]
    npm tag <project>@<version> [<tag>]
    npm unpublish <project>[@<version>]
    npm update

Commands that work - local:

    npm bin / npm prefix / npm root
    npm bugs / npm docs
    npm cache ...
    npm completion
    npm config ... / npm get / npm set
    npm edit / npm explore
    npm faq / npm help / npm help-search
    npm init
    npm link
    npm ls
    npm pack
    npm rebuild
    npm rm / npm uninstall / npm prune
    npm run-script/ npm start / npm restart / npm stop / npm test
    npm submodule
    npm shrinkwrap
    npm version
    npm whoami
