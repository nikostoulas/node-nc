import Config from './config';
import * as vm from 'vm';
import { getRegexStrs } from './helpers';

let regex;

export function getRegex() {
  if (!regex) {
    const { space, name, nestedParentheses } = getRegexStrs();
    regex = new RegExp(`await${space}((?:${name}(?:${nestedParentheses})*)+)`, 'g');
  }
  return regex;
}

export default async function(cmd: string, context: any) {
  const yieldableRegex = getRegex();
  let i = 0;
  let newCmd = cmd;
  let match;
  context.localContext = [];
  while ((match = yieldableRegex.exec(cmd)) !== null) {
    try {
      context.localContext[i] = Config.config.useGlobal
        ? await vm.runInThisContext(match[1])
        : await vm.runInContext(match[1], context);
      newCmd = newCmd.replace(match[0], `localContext[${i}]`);
    } catch (e) {
      context.localContext[i] = () => {
        throw e;
      };
      newCmd = newCmd.replace(match[0], `localContext[${i}]()`);
    }
    i++;
  }
  return newCmd;
}
