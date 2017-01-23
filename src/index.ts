#! /usr/bin/env node
import * as repl from 'repl';
import * as vm from 'vm';
import * as fs from 'fs';
const history = '.node_history';

const hasPackage = fs.existsSync('./package.json');
let prompt = 'nc > ';
if (hasPackage) {
  const pack = require(process.cwd() + '/package.json');
  prompt = pack.name + '> ';
}

if (!fs.existsSync(history)) {
  fs.writeFileSync(history, '');
}

if (fs.existsSync('./console.js')) {
  // require(process.cwd() + '/console.js');
}

async function transformResult(cmd, localContext) {
  const yieldableRegex = /await\s+((?:[a-zA-Z0-9_\.]+)(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))?)/g;
  let i = 0;
  let newCmd = cmd;
  let match;
  while ((match = yieldableRegex.exec(cmd)) !== null) {
    localContext[i] = await vm.runInThisContext(match[1]);
    newCmd = newCmd.replace(match[0], `localContext[${i}]`);
    i++;
  }
  return newCmd;
}

const server = repl.start({
  prompt,
  input: process.stdin,
  output: process.stdout,
  replMode: (<any>repl).REPL_MODE_MAGIC,
  useGlobal: true,
  eval: async function (cmd, context, filename, callback) {
    try {
      context.localContext = [];
      const newCmd = await transformResult(cmd, context.localContext);
      const result = vm.runInThisContext(newCmd);
      callback(null, result);
    } catch (e) {
      if (isRecoverableError(e)) {
        return callback(new (<any>repl).Recoverable(e));
      }
      callback(e);
    }
  }
});

function isRecoverableError(error) {
  if (error.name === 'SyntaxError') {
    return /^(Unexpected end of input|Unexpected token)/.test(error.message);
  }
  return false;
}

fs.readFileSync(history)
  .toString()
  .split(`\n`)
  .reverse()
  .filter(line => line.trim())
  .map(line => (<any>server).history.push(line));

process.on('exit', function () {
  fs.appendFileSync(history, (<any>server).lines.join('\n') + '\n');
});
