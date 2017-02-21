import {
  globalize,
  globalizeFiles,
  globalizeDependencies
} from '../globalize-files';
import * as gf from '../globalize-files';
import * as hp from '../handle-package';
import * as should from 'should';
import profiler from '../profiler';
import * as glob from 'glob';
import * as sinon from 'sinon';
import Config from '../config';

const sandbox = sinon.sandbox.create();

describe('Test globalize files', function () {

  afterEach(function () {
    sandbox.restore();
  });

  describe('Test globalize method', function () {
    it('should add file to context', function () {
      const context: any = {};
      globalize(context, 'test', './test/globalize-files.test.js');
      context.test.should.eql({});
      context.$test$.should.equal('./test/globalize-files.test.js');
    });

    it('should allow context to be overwritten', function () {
      const context: any = {};
      globalize(context, 'test', './test/globalize-files.test.js');
      context.test = 'test';
      should.equal(undefined, context.test);
    });

    it('should not throw if module is not found', function () {
      const context: any = {};
      globalize(context, 'test', './test/notFound.js');
      should.equal(undefined, context.test);
    });

    it('should handle default exports', function () {
      const context: any = {};
      globalize(context, 'globalize', './globalize-files.js');
      (typeof context.globalize).should.equal('function');
      context.globalize.default.should.eql(context.globalize);
    });

    it('should not override values', function () {
      const context: any = { };
      (<any>global).test = 'test';
      globalize(context, 'test', './test/globalize-files.test.js');
      should.equal(context.test, undefined);
      delete (<any>global).delete;
    });
  });

  describe('Test globalizeFiles method', function () {
    it('should globalize all project files', async function () {
      const context: any = {};
      globalizeFiles(context);
      await new Promise(r => setTimeout(r, 30));
      context.profiler.should.equal(profiler);
      context.$profiler$.should.endWith('build/profiler.js');
    });
  });

  describe('Test globalizeDependencies', function () {
    it('should globalize dependencies', function () {
      const context: any = {};
      globalizeDependencies(context);
      context.glob.should.equal(glob);
      context.$glob$.should.endWith('node_modules/glob');
    });
  });

  describe('Test default method', function () {
    context('when not in a node project', function () {
      it('should do nothing', function () {
        const flag = hp.isInNodeProject;
        (<any>hp).isInNodeProject = false;
        const server: any = { context: {} };
        gf.default(server);
        (<any>hp).isInNodeProject = flag;
        should.equal(undefined, server.context.profiler);
      });
    });

    context('when in a node project and with UseGlobal true', function () {
      before(function () {
        Config.setConfig({ useGlobal: true });
      });

      after(function () {
        Config.setConfig({ useGlobal: false });
      });

      it('should add context nested in nc', async function () {
        const server: any = { context: {} };
        gf.default(server);
        await new Promise(r => setTimeout(r, 30));
        (typeof server.context.reload).should.equal('function');
        server.context.nc.profiler.should.equal(profiler);
        server.context.nc.glob.should.equal(glob);
      });
    });

    context('when in a node project and with UseGlobal false', function () {
      it('should add context', async function () {
        const server: any = { context: {} };
        gf.default(server);
        await new Promise(r => setTimeout(r, 30));
        (typeof server.context.reload).should.equal('function');
        server.context.profiler.should.equal(profiler);
        server.context.glob.should.equal(glob);
      });
    });
  });
});
