import Config from '../config';

describe('Test config', function() {
  context('when no env variable is set', function() {
    it('should return default env', async function() {
      Config.config.should.eql({
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
      });
    });
  });

  context('when setConfig is used', function() {
    afterEach(function() {
      Config.setConfig({});
    });

    it('uses set config', async function() {
      Config.setConfig({ useAsync: false });
      Config.config.should.eql({
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
      });
    });
  });
});
