import { compact, convertBoolean } from './helpers';

const defaultConf = {
  useGlobal: false,
  useAsync: false,
  globalizeFiles: true,
  globalizeDependencies: true,
  useNcFile: true,
  usePackageFile: true,
  writeHistoryFile: true,
  historyFileName: '.nc_history',
  suggestParams: true,
  onExit: false
};

const envConf = compact(
  convertBoolean({
    useGlobal: process.env.NC_USE_GLOBAL,
    useAsync: process.env.NC_USE_ASYNC,
    globalizeFiles: process.env.NC_GLOBALIZE_FILES,
    globalizeDependencies: process.env.NC_GLOBALIZE_DEPENDENCIES,
    useNcFile: process.env.NC_USE_NC_FILE,
    usePackageFile: process.env.NC_USE_PACKAGE_FILE,
    writeHistoryFile: process.env.NC_WRITE_HISTORY_FILE,
    historyFileName: process.env.NC_HISTORY_FILE_NAME,
    suggestParams: process.env.NC_SUGGEST_PARAMS
  })
);

export default class Config {
  private static _config = {};

  static get config() {
    return { ...defaultConf, ...envConf, ...this._config };
  }

  static setConfig(conf) {
    this._config = conf;
  }
}
