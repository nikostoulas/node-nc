import Config from './config';
import * as fs from 'fs';
import * as path from 'path';
import { root } from './handle-package';

export default function () {
  if (Config.config.useNcFile) {
    if (fs.existsSync('./nc.js')) {
      global.setConfig = Config.setConfig.bind(Config);
      require(path.join(root, 'nc.js'));
    }
  }
}

declare var global: NodeJS.Global & typeof globalThis;
declare global {
  const setConfig: Function;

  namespace NodeJS {
    interface Global {
      setConfig: Function;
    }
  }
}
