import Config from './config';
import * as vm from 'vm';

export default async function (cmd: string, context: any) {
  if (Config.config.useAsync) {
    const yieldableRegex = /await\s+((?:[a-zA-Z0-9_\.]+)(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))?)/g;
    let i = 0;
    let newCmd = cmd;
    let match;
    while ((match = yieldableRegex.exec(cmd)) !== null) {
      context.localContext[i] = Config.config.useGlobal ?
        await vm.runInThisContext(match[1]) :
        await vm.runInContext(match[1], context);
      newCmd = newCmd.replace(match[0], `localContext[${i}]`);
      i++;
    }
    return newCmd;
  }
  return cmd;
}
