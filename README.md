```
.  .       .        ,-.                 .
|\ |       |       /                    |
| \| ,-. ,-| ,-.   |    ,-. ;-. ,-. ,-. | ,-.
|  | | | | | |-'   \    | | | | `-. | | | |-'
'  ' `-' `-' `-'    `-' `-' ' ' `-' `-' ' `-'

```

## About

This module extends Node.js [basic repl](https://nodejs.org/api/repl.html) functionality:

* Makes all js files global
* Makes all modules included in package.json global
* Awaits promises (experimental).
* Writes commands to a local history file.
* Configurable behavior using env variables or a nc.js file.

## Installation

`npm install -g node-nc`

## Usage

Enter `nc` to enter the repl.
It is intended to be used inside  Node.js projects. The nc command can also be invoked from a projects subfolder.
If used outside a project it will be like it was used in the users home folder and will not globalize any file.


![nc](https://raw.githubusercontent.com/nikostoulas/node-nc/master/usage.gif)]

## Configuration

```javascript
const defaultConf = {
  useGlobal: false, // Repl useGlobal. If set to true all globals will be inside nc namespace.
  useAsync: true, // Experimental use of await in repl.
  globalizeFiles: true, // Make all project files global.
  globalizeDependencies: true, // Globalize projects dependencies.
  useNcFile: true, // Use nc.js file if found
  usePackageFile: true, // Use package file to determine prompt, root folter and dependencies.
  writeHistoryFile: true, // Write all commands to a file.
  historyFileName: '.node_history' // The history filename. An absolute path can also be given.
};
```

Configuration can be overwitten

* by env variables:

  NC_USE_GLOBAL, NC_USE_ASYNC, NC_GLOBALIZE_FILES,
  NC_GLOBALIZE_DEPENDENCIES, NC_USE_NC_FILE, NC_USE_PACKAGE_FILE,
  NC_WRITE_HISTORY_FILE, NC_HISTORY_FILE_NAME or
* by using an nc.js file. This file can also be used to make some project initializations

  Eg. connect to a database, declare some global vars etc.
  In nc.js a method setConfig(options) is available to overwrite the default configurations.

  Note that NC_USE_NC_FILE env variable must not be false.

  Eg:

  ```javascript
    setEnv({useGlobal:true}); // it only overwrites useGlobal config.
  ```

