import Config from './config';
import * as glob from 'glob';
import { root, packageJson, isInNodeProject } from './handle-package';
import * as path from 'path';
import { camelCase } from './helpers';

export default function (server) {
  if (!isInNodeProject) {
    return;
  }

  server.context.reload = () => {
    Object.keys(require.cache).forEach((key) => delete require.cache[key]);
  };

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

function globalize(context, name, path) {
  name = camelCase(name);
  if (name && !global[name]) {
    Object.defineProperty(context, `$${name}$`, {
      enumerable: false, configurable: true, get: function () {
        return path;
      }
    });
    Object.defineProperty(context, name, {
      enumerable: false, configurable: true, get: function () {
        let required = require(path);
        if (required.default) {
          let tmp = required;
          required = required.default;
          Object.assign(required, tmp);
        }
        return required;
      }
    });
  }
}

function globalizeFiles(context) {
  glob('**/*.js', { ignore: '**/node_modules/**', cwd: root }, function (err, files = []) {
    if (err) {
      return err;
    }
    const filenameRegexp = new RegExp('^\/?(?:.+\/)*(.+)\\.(?:.+)$');
    files.forEach(f => {
      const filename = filenameRegexp.exec(f)[1];
      globalize(context, filename, path.join(root, f));
    });
  });
}

function globalizeDependencies(context) {
  const files = [...Object.keys(packageJson.dependencies || {}), ...Object.keys(packageJson.devDependencies || {})];
  files.forEach(f => globalize(context, f, path.join(root, 'node_modules', f)));
}
