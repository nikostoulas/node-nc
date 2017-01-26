import Config from './config';
import * as path from 'path';
import * as fs from 'fs';

export let root = process.cwd();
export let isInNodeProject = false;
export let name = 'nc> ';

function init() {
  if (!Config.config.usePackageFile) {
    return;
  }
  let hasPackage = false;
  do {
    hasPackage = fs.existsSync(path.join(root, './package.json'));
    if (!hasPackage) {
      root = path.join(root, '..');
    } else {
      isInNodeProject = true;
      return name = require(path.join(root, 'package.json')).name + '> ';
    }
  } while (root !== path.sep);
}

init();
