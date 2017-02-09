import Config from './config';
import * as vm from 'vm';

export default async function (cmd: string, context: any) {
  const yieldableRegex = ///await\s+((?:[a-zA-Z0-9_\.]+)(\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\))?)/g;
                         /await[\t\f\v ]+((:?[^(),\n\]\[]*(?:\((?:[^()\n]|(?:(?:\([^()]*\))*))*\))*)+)/g;
  let i = 0;
  let newCmd = cmd;
  let match;
  context.localContext = [];
  while ((match = yieldableRegex.exec(cmd)) !== null) {
    try {
      context.localContext[i] = Config.config.useGlobal ?
        await vm.runInThisContext(match[1]) :
        await vm.runInContext(match[1], context);
      newCmd = newCmd.replace(match[0], `localContext[${i}]`);
    } catch (e) {
      context.localContext[i] = () => { throw e; };
      newCmd = newCmd.replace(match[0], `localContext[${i}]()`);
    }
    i++;
  }
  return newCmd;
}
