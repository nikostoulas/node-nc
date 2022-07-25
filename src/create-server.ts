import * as repl from 'repl';
import * as vm from 'vm';
import Config from './config';
import parseAsync from './parse-async';
import { name } from './handle-package';

export function isRecoverableError(error) {
  if (error.name === 'SyntaxError') {
    return /^(Unexpected end of input|Unexpected token [()\[\]{}]|missing)/.test(error.message);
  }
  return false;
}

export default function (prompt = name) {
  const server = repl.start({
    prompt,
    input: process.stdin,
    output: process.stdout,
    replMode: (<any>repl).REPL_MODE_SLOPPY,
    preview: true,
    useGlobal: Config.config.useGlobal,
    eval: async function (cmd, context, filename, callback) {
      try {
        let newCmd = cmd;
        if (cmd.indexOf('await') !== -1 && Config.config.useAsync) {
          newCmd = await parseAsync(cmd, context);
        }
        const result = Config.config.useGlobal ? vm.runInThisContext(newCmd) : vm.runInContext(newCmd, context);
        callback(null, result);
      } catch (e) {
        if (isRecoverableError(e)) {
          return callback(new (<any>repl).Recoverable(e), null);
        }
        callback(e, null);
      }
    }
  });
  server.on('exit', () => {
    let onExit =
      Config.config.onExit ||
      (() => {
        /* */
      });
    if (typeof onExit !== 'function') {
      onExit = () => {
        console.error('The `onExit` hook is not a function!');
      };
    }
    Promise.resolve(onExit())
      .then(() => {
        process.exit();
      })
      .catch(() => {
        process.exit();
      });
  });
  return server;
}
