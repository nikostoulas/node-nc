import * as vm from 'vm';

export function runWithTimeout(cb, timeout) {
  const sandbox = {
    result: null,
    cb
  };
  var context = vm.createContext(sandbox);
  var script = new vm.Script('result = cb()');

  try {
    script.runInContext(context, { timeout: 100 }); // milliseconds
  } catch (e) {
    return;
  }
  return sandbox.result;
}
