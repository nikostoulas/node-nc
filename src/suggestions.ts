import Config from './config';
import { runWithTimeout } from './vm';
import * as vm from 'vm';

const readline = require('readline');
let regex;

const nativeFunctions = {
  [String.prototype.substr.toString()]: '(from: number, length?: number): string',
  [String.prototype.endsWith.toString()]: '(searchString: string, endPosition?: number): boolean',
  [String.prototype.substring.toString()]: '(start: number, end?: number): string',
  [String.prototype.search.toString()]: '(regexp: string): number',
  [Array.prototype.splice.toString()]: '(start: number, deleteCount: number, ...items: T[]): T[]',
  [Array.prototype.slice.toString()]: '(start?: number, end?: number): T[]',
  [Array.prototype.concat.toString()]: '(...items: T[][]): T[]',
  [Array.prototype.filter.toString()]: '(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any): T[]',
  [Array.prototype.map.toString()]: '(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[]',
  [Array.prototype.forEach.toString()]: '(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void',
  [Array.prototype.find.toString()]: '(predicate: (value: T, index: number, obj: Array<T>) => boolean, thisArg?: any): T | undefined',
  [Array.prototype.fill.toString()]: '(value: T, start?: number, end?: number): this',
  [Object.keys.toString()]: '(o: any): string[]',
  [Object.defineProperties.toString()]: '(o: any, properties: PropertyDescriptorMap)',
  [Object.defineProperty.toString()]: '(o: any, p: string, attributes: PropertyDescriptor)',
};

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
  if (!regex) {
    regex = new RegExp(`((?:new .*\\))?(?:\\[[^()\\n=\\[\\]]*\\])?\
(?:[^()\\n= ]*(?:\\((?:[^()\\n]|(?:\\([^()\\n]*\\)))*\\))*)+)\\([^()\\n]*$`);
  }
  let match = runWithTimeout(() => regex.exec(str), 100);
  if (match && match[1]) {
    return match[1].trim();
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
    if (nativeFunctions[fn.toString()]) {
      return nativeFunctions[fn.toString()];
    }

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
  (<any>process.stdout).clearScreenDown();
  (<any>process.stdout).moveCursor(-str.length - 9);
  (<any>process.stdout).cursorTo(cursor);
}

export default function suggest(server) {
  server.input.on('data', data => {
    const cmd = server.line;
    const cursor = (server.cursor + server._prompt.length) % server.columns;
    const lastColumn = server.line.length + server._prompt.length;
    try {
      if (cmd.indexOf('(') !== -1) {
        print(functionToParams(cmd, server.context), lastColumn, cursor);
      }
    } catch (e) {
      print(e.message, lastColumn, cursor);
    }
  });
}
