import Config from './config';
import * as fs from 'fs';
import * as path from 'path';
import { root } from './handle-package';

export default function () {
  if (Config.config.useConsoleFile) {
    if (fs.existsSync('./console.js')) {
      (<any>global).setConfig = Config.setConfig.bind(Config);
      require(path.join(root, 'console.js'));
    }
  }
}
