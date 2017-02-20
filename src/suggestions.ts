import Config from './config';
import { name } from './handle-package';
import * as vm from 'vm';

const readline = require('readline');

export function getParams(fn: Function) {
  const str = fn.toString();
  let match;
  if (str.startsWith('class')) {
    match = str.replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '')
      .match(/constructor\s*[^\(]*\(\s*([^\)]*)\)/m);
    if (!match && (<any>fn).__proto__) {
      match = (<any>fn).__proto__.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '')
        .match(/constructor\s*[^\(]*\(\s*([^\)]*)\)/m);
    }
  } else {
    match = str.replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg, '')
      .match(/^(?:function)?\s*[^\(]*\(\s*([^\)]*)\)/m);
  }
  if (match) {
    return (match[1] || '').split(/,/);
  }
}

export function getFnStr(str) {
  const regex = /(['"\w_0-9.()\[\]]+)\([^)\n\]\[]*$/;
  let match = regex.exec(str);
  if (match && match[1]) {
    return match[1];
  }
}

export function getFn(fn, context) {
  if (fn) {
    return Config.config.useGlobal ?
      vm.runInThisContext(fn) :
      vm.runInContext(fn, context);
  }
}

export function functionToParams(cmd, context) {
  const fnStr = getFnStr(cmd);
  const fn = getFn(fnStr, context);
  if (fn) {
    const params = getParams(fn);
    if (Array.isArray(params)) {
      return `(${params.join(', ')})`;
    }
  }
  return '';
}

export function print(str, lastColumn, cursor) {
  (<any>process.stdout).cursorTo(lastColumn);
  process.stdout.write(`        \x1b[2m\x1b[37m${str}\x1b[0m`);
  (<any>process.stdout).clearLine(1);
  (<any>process.stdout).moveCursor(-str.length - 9);
  (<any>process.stdout).cursorTo(cursor);
}

export default function suggest(server) {
  server.input.on('data', data => {
    const cmd = server.line;
    const cursor = (server.cursor + name.length) % server.columns;
    const lastColumn = server.line.length + name.length;
    try {
      if (cmd.indexOf('(') !== -1) {
        print(functionToParams(cmd, server.context), lastColumn, cursor);
      }
    } catch (e) {
      print(e.message, lastColumn, cursor);
    }
  });
}
