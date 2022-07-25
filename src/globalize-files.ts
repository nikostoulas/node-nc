import Config from './config';
import * as glob from 'glob';
import { root, packageJson, isInNodeProject } from './handle-package';
import * as path from 'path';
import { camelCase } from './helpers';
import importNc from './import-nc';

export default function (server) {
  if (!isInNodeProject) {
    return;
  }

  server.context.reload = (loadNc = false) => {
    Object.keys(require.cache).forEach((key) => delete require.cache[key]);
    if (loadNc) {
      importNc();
    }
    return true;
  };

  server.defineCommand('reload', {
    help: 'Reloads global files',
    action(loadNc = 'false') {
      this.clearBufferedCommand();
      Object.keys(require.cache).forEach((key) => delete require.cache[key]);
      if (loadNc === 'true') {
        importNc();
      }
      this.displayPrompt();
    }
  });

  let context = server.context;
  if (Config.config.useGlobal) {
    context.nc = {};
    context = context.nc;
  }

  if (Config.config.globalizeFiles) {
    globalizeFiles(context);
  }

  if (Config.config.globalizeDependencies) {
    globalizeDependencies(context);
  }
}

export function globalize(context, name: string, path) {
  name = camelCase(name);
  if (name && !global[name]) {
    Object.defineProperty(context, `$${name}$`, {
      enumerable: false,
      configurable: true,
      get: function () {
        return path;
      }
    });
    Object.defineProperty(context, name, {
      enumerable: false,
      configurable: true,
      get: function () {
        try {
          let required = require(path);

          if (required.default) {
            let tmp = required;
            required = required.default;
            Object.assign(required, tmp);
          }
          return required;
        } catch (e) {
          console.error(e);
        }
      },
      set: function (value) {
        delete context[name];
        delete context[`$${name}$`];
      }
    });
  }
}

export function globalizeFiles(context) {
  const filenameRegexp = new RegExp('^/?(?:.+/)*(.+)\\.(?:.+)$');
  glob('**/*.js', { ignore: ['**/node_modules/**', '**/test/**'], cwd: root }, function (err, files = []) {
    if (err) {
      return err;
    }
    files.forEach((f) => {
      const filename = filenameRegexp.exec(f) && filenameRegexp.exec(f)![1];
      if (filename) {
        globalize(context, filename, path.join(root, f));
      }
    });
  });
}

export function globalizeDependencies(context) {
  const files = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {})
  ];
  files.forEach((f) => globalize(context, f, path.join(root, 'node_modules', f)));
}
