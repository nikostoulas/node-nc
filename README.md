```
.  .       .        ,-.                 .
|\ |       |       /                    |
| \| ,-. ,-| ,-.   |    ,-. ;-. ,-. ,-. | ,-.
|  | | | | | |-'   \    | | | | `-. | | | |-'
'  ' `-' `-' `-'    `-' `-' ' ' `-' `-' ' `-'

```
## About

[![Greenkeeper badge](https://badges.greenkeeper.io/nikostoulas/node-nc.svg)](https://greenkeeper.io/)

Have you missed a good [repl](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) while developing a Node.js project?  
Use node-nc to easily configure your project's console (similar to rails c).  
Just type node-nc in any of your project's folder.

## Installation

```bash
$ npm install -g node-nc
```

## Usage

```bash
$ node-nc # or nc
nc > reload() // reloads all global files
nc > $module$ // the path that is required when using module
nc > module   // the module
```

It is intended to be used inside  Node.js projects.  
The nc command can also be invoked from a projects subfolder.  
If used outside a project it will not globalize any file and will save history to `~/.nc_history` (`~/${config.historyFileName}`).

![nc](https://raw.githubusercontent.com/nikostoulas/node-nc/master/usage.gif)

## Details

This module extends Node.js [basic repl](https://nodejs.org/api/repl.html) functionality:

* Makes all js files global
* Makes all modules included in package.json global
* Awaits promises (experimental).
* Writes commands to a local history file.
* Configurable behavior using env variables or a nc.js file.
* Suggests params for functions and methods (experimental).


## Configuration

```javascript
const defaultConf = {
  useGlobal: false, // Repl useGlobal. If set to true all globals will be inside nc namespace.
  useAsync: true, // Experimental use of await in repl.
  globalizeFiles: true, // Make all project files global.
  globalizeDependencies: true, // Globalize projects dependencies.
  useNcFile: true, // Use nc.js file if it exists.
  usePackageFile: true, // Use package file to determine prompt, root folter and dependencies.
  writeHistoryFile: true, // Write all commands to a file.
  historyFileName: '.nc_history', // The history filename. An absolute path can also be given.
  suggestParams: true // Experimental suggestion of params when calling a function
};
```

Configuration can be overwitten

* by env variables:

  NC_USE_GLOBAL, NC_USE_ASYNC, NC_GLOBALIZE_FILES,
  NC_GLOBALIZE_DEPENDENCIES, NC_USE_NC_FILE, NC_USE_PACKAGE_FILE,
  NC_WRITE_HISTORY_FILE, NC_HISTORY_FILE_NAME, NC_SUGGEST_PARAMS or
* by using an nc.js file. This file can also be used to make some project initializations
  Eg. connect to a database, declare some global vars etc.
  In nc.js a method setConfig(options) is available to overwrite the default configurations.
  Note that NC_USE_NC_FILE env variable must not be false.

  Example of a simple nc.js file:

  ```javascript

    // overwrite useGlobal
    setConfig({ useGlobal:true });.

    // connect to db
    mongoose.connect(mongooseDb, options, function (err, data) {});
  ```

## Using await

If you have a very complicated expression (many nested expresssions) it is better to split it in two:

```javascript
// Bad
await Compicated-Epression

// Good
const promise = Complicated-expression
await promise;
```

This way await will work as expected.

## Function Parameter Suggestions

When you type a parenthesis repl will try to figure out if the previous expression is
a function and suggest its parameters.

## Build in profiler

Test a function's performance using the buildin profiler.
The function can return a promise.

```bash
node-nc> profiler(() => fib(10))
Function ()=> fib(10) ran 40,770 times in 995.99 ms

node-nc> await profiler(() => fib(20))
Function ()=> fib(20) ran 328 times in 942.71 ms

node-nc> await profiler(() => Promise.resolve(true), () => {})
Run function ()=> Promise.resolve(true) 171,784 times in 1020.95 ms
Run function ()=>{} 111,795,737 times in 1007.90 ms
```
