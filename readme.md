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

Installing packages:

    npm install foo

... will search the cache for the package, if the package is not cached then it fetches from registry.npmjs.org.

Publishing to the local npm:

    npm publish

... the npm server will accept the

Misc working:

    npm view foo

Local commands that work:

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
    npm rm / npm uninstall / npm prune
    npm run-script/ npm start / npm restart / npm stop / npm test
    npm submodule
    npm shrinkwrap
    npm version
    npm whoami

## Remote commands todo

    npm search foo ## NO
    npm outdated
    npm update ## NO
    npm adduser

    deprecate   npm deprecate <pkg>[@<version>] <message>

    outdated    npm outdated [<pkg> [<pkg> ...]]

    owner       npm owner add <username> <pkg>
                npm owner rm <username> <pkg>
                npm owner ls <pkg>

    pack        npm pack <pkg>

    rebuild     npm rebuild [<name>[@<version>] [name[@<version>] ...]]

    search      npm search [some search terms ...]

    star        npm star <package> [pkg, pkg, ...]
                npm unstar <package> [pkg, pkg, ...]

    tag         npm tag <project>@<version> [<tag>]

    unpublish   npm unpublish <project>[@<version>]

    update      npm update [pkg]
