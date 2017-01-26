import Config from './config';
import * as glob from 'glob';
import { root } from './handle-package';
import * as path from 'path';

export default function (server) {
  if (Config.config.globalizeFiles) {
    glob('**/*.js', { ignore: '**/node_modules/**', cwd: root }, function (err, files) {
      const filenameRegexp = new RegExp('^\/?(?:.+\/)*(.+)\\.(?:.+)$');
      let context = server.context;
      if (Config.config.useGlobal) {
        context.g = {};
        context = context.g;
      }
      files.forEach(f => {
        const filename = filenameRegexp.exec(f)[1];
        if (filename && !global[filename]) {
          Object.defineProperty(context, `$${filename}$`, {
            enumerable: false, configurable: true, get: function () {
              return path.join(root, f);
            }
          });

          Object.defineProperty(context, filename, {
            enumerable: false, configurable: true, get: function () {
              let required = require(path.join(root, f));
              if (required.default) {
                let tmp = required;
                required = required.default;
                Object.assign(required, tmp);
              }
              return required;
            }
          });
        }
      });
    });
  }
}
