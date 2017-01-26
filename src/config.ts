import { compact, convertBoolean } from './helper';

const defaultConf = {
  useGlobal: false,
  useAsync: true,
  globalizeFiles: true,
  useConsoleFile: true,
  usePackageFile: true,
  writeHistoryFile: true,
  historyFileName: '.node_history'
};

const envConf = compact(convertBoolean({
  useGlobal: process.env.NC_USE_GLOBAL,
  useAsync: process.env.NC_USE_ASYNC,
  globalizeFiles: process.env.NC_GLOBALIZE_FILES,
  useConsoleFile: process.env.NC_USE_CONSOLE_FILE,
  usePackageFile: process.env.NC_USE_PACKAGE_FILE,
  writeHistoryFile: process.env.NC_WRITE_HISTORY_FILE,
  historyFileName: process.env.NC_HISTORY_FILE_NAME
}));

export default class Config {
  private static _config = {};

  static get config() {
    return { ...defaultConf, ...envConf, ...this._config };
  }

  static setConfig(conf) {
    this._config = conf;
  }
}



