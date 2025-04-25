import * as vm from 'vm';
import * as repl from 'repl';
import { isRecoverableError, default as createServer } from '../create-server';
import Config from '../config';
import * as parseAsync from '../parse-async';
import * as EventEmitter from 'events';

import * as sinon from 'sinon';
const sandbox = sinon.createSandbox();

describe('Test Create Server', function () {
  let ctx;

  before(function () {
    Config.setConfig({ useAsync: true });
  });

  after(function () {
    Config.setConfig({ useAsync: false });
  });

  beforeEach(function () {
    ctx = vm.createContext();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Test isRecoverableError', function () {
    it('handles unexpected end of input', function () {
      const error = new SyntaxError('Unexpected end of input');
      isRecoverableError(error).should.be.true();
    });

    it('handles unexpected token', function () {
      const error = new SyntaxError('Unexpected token }');
      isRecoverableError(error).should.be.true();
    });

    it('throws error for unknown unexpected token', function () {
      const error = new SyntaxError('Unexpected token new');
      isRecoverableError(error).should.be.false();
    });

    it('handles missing', function () {
      const error = new SyntaxError('missing ) after argument list');
      isRecoverableError(error).should.be.true();
    });
  });

  describe('Test createServer', function () {
    let replStartStub;
    let cb;
    let emitterMock;

    beforeEach(function () {
      const EventEmitter = require('events');
      emitterMock = new EventEmitter();
      replStartStub = sandbox.stub(repl, 'start').returns(emitterMock);
      cb = sandbox.stub();
    });

    it('initializes with some defaults', function () {
      createServer();
      replStartStub.args.should.containDeep([
        [
          {
            prompt: 'node-nc> ',
            replMode: (<any>repl).REPL_MODE_SLOPPY,
            useGlobal: Config.config.useGlobal,
            preview: true
          }
        ]
      ]);
      replStartStub.args[0][0].input.should.eql(process.stdin);
      replStartStub.args[0][0].output.should.eql(process.stdout);
    });

    context('when cmd contains await', function () {
      it('should parseAsync', async function () {
        const parseAsyncStub = sandbox.stub(parseAsync, 'default').returns(1);
        createServer();
        await replStartStub.args[0][0].eval('await Promise.resolve(1)', ctx, '', cb);
        parseAsyncStub.args.should.eql([['await Promise.resolve(1)', ctx]]);
        cb.args.should.containDeep([[null, 1]]);
      });
    });

    context('when useAsync is false', function () {
      before(function () {
        Config.setConfig({ useAsync: false });
      });

      after(function () {
        Config.setConfig({ useAsync: true });
      });

      it('should not parseAsync', async function () {
        const parseAsyncStub = sandbox.stub(parseAsync, 'default').returns(1);
        createServer();
        parseAsyncStub.called.should.be.false();
      });

      it('should pass  breakEvalOnSigint true', async function () {
        createServer();
        replStartStub.args.should.eql([[{
          breakEvalOnSigint: true,
          eval: undefined,
          input: process.stdin,
          output: process.stdout,
          preview: true,
          prompt: 'node-nc> ',
          useGlobal: false,
          replMode: repl.REPL_MODE_SLOPPY
        }]]);
      });
    })

    context('when useGlobal is false', function () {
      it('should runInContext', async function () {
        const runStub = sandbox.stub(vm, 'runInContext');
        createServer();
        await replStartStub.args[0][0].eval('1', ctx, '', cb);
        runStub.args.should.eql([['1', ctx]]);
      });
    });

    context('when useGlobal is true', function () {
      before(function () {
        Config.setConfig({ useGlobal: true, useAsync: true });
      });

      after(function () {
        Config.setConfig({ useGlobal: false, useAsync: true });
      });

      it('should run command in this context', async function () {
        const runStub = sandbox.stub(vm, 'runInThisContext');
        createServer();
        await replStartStub.args[0][0].eval('1', ctx, '', cb);
        runStub.args.should.eql([['1']]);
      });
    });

    context('when an error occurs', function () {
      it('should return recoverable error', async function () {
        const error = new SyntaxError('missing ) after argument list');
        sandbox.stub(vm, 'runInContext').throws(error);
        createServer();
        await replStartStub.args[0][0].eval('1', ctx, '', cb);
        cb.args[0][0].should.eql(new (<any>repl).Recoverable(error));
      });

      it('should return error', async function () {
        const error = new Error('test error');
        sandbox.stub(vm, 'runInContext').throws(error);
        createServer();
        await replStartStub.args[0][0].eval('1', ctx, '', cb);
        cb.args[0][0].should.eql(error);
      });
    });
  });

  describe('Test onExit hook', () => {
    let emitterMock;
    beforeEach(function () {
      sandbox.stub(process, 'exit');
      emitterMock = new EventEmitter();
      sandbox.stub(repl, 'start').returns(emitterMock);
    });

    after(function () {
      Config.setConfig({ onExit: false });
    });

    context('when the onExit hook is configured', () => {
      it('should run the onExit hook before repl exists', () => {
        const onExit = sandbox.stub();
        Config.setConfig({ onExit });
        createServer();
        emitterMock.emit('exit');
        sandbox.assert.calledOnce(onExit);
      });
    });
    context('when the onExit hook is not a function', () => {
      it('should be ignored', () => {
        Config.setConfig({ onExit: 'just a string' });
        createServer();
        emitterMock.emit('exit');
      });
    });
  });
});
