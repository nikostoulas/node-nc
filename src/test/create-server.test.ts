import * as vm from 'vm';
import * as repl from 'repl';
import { isRecoverableError, default as createServer } from '../create-server';
import Config from '../config';
import * as parseAsync from '../parse-async';

import * as sinon from 'sinon';
const sandbox = sinon.sandbox.create();

describe('Test Create Server', function() {
  let ctx;

  beforeEach(function() {
    ctx = vm.createContext();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('Test isRecoverableError', function() {
    it('handles unexpected end of input', function() {
      const error = new SyntaxError('Unexpected end of input');
      isRecoverableError(error).should.be.true();
    });

    it('handles unexpected token', function() {
      const error = new SyntaxError('Unexpected token }');
      isRecoverableError(error).should.be.true();
    });

    it('throws error for unknown unexpected token', function() {
      const error = new SyntaxError('Unexpected token new');
      isRecoverableError(error).should.be.false();
    });

    it('handles missing', function() {
      const error = new SyntaxError('missing ) after argument list');
      isRecoverableError(error).should.be.true();
    });
  });

  describe('Test createServer', function() {
    let replStartStub;
    let cb;
    beforeEach(function() {
      replStartStub = sandbox.stub(repl, 'start');
      cb = sandbox.stub();
    });

    it('initializes with some defaults', function() {
      createServer();
      replStartStub.args.should.containDeep([
        [
          {
            prompt: 'node-nc> ',
            replMode: (<any>repl).REPL_MODE_MAGIC,
            useGlobal: Config.config.useGlobal
          }
        ]
      ]);
      replStartStub.args[0][0].input.should.eql(process.stdin);
      replStartStub.args[0][0].output.should.eql(process.stdout);
    });

    context('when cmd contains await', function() {
      it('should parseAsync', async function() {
        const parseAsyncStub = sandbox.stub(parseAsync, 'default').returns(1);
        createServer();
        await replStartStub.args[0][0].eval('await Promise.resolve(1)', ctx, '', cb);
        parseAsyncStub.args.should.eql([['await Promise.resolve(1)', ctx]]);
        cb.args.should.containDeep([[null, 1]]);
      });
    });

    context('when useGlobal is false', function() {
      it('should runInContext', async function() {
        const runStub = sandbox.stub(vm, 'runInContext');
        createServer();
        await replStartStub.args[0][0].eval('1', ctx, '', cb);
        runStub.args.should.eql([['1', ctx]]);
      });
    });

    context('when useGlobal is true', function() {
      before(function() {
        Config.setConfig({ useGlobal: true });
      });

      after(function() {
        Config.setConfig({ useGlobal: false });
      });

      it('should run command in this context', async function() {
        const runStub = sandbox.stub(vm, 'runInThisContext');
        createServer();
        await replStartStub.args[0][0].eval('1', ctx, '', cb);
        runStub.args.should.eql([['1']]);
      });
    });

    context('when an error occurs', function() {
      it('should return recoverable error', async function() {
        const error = new SyntaxError('missing ) after argument list');
        const runStub = sandbox.stub(vm, 'runInContext').throws(error);
        createServer();
        await replStartStub.args[0][0].eval('1', ctx, '', cb);
        cb.args[0][0].should.eql(new (<any>repl).Recoverable(error));
      });

      it('should return error', async function() {
        const error = new Error('test error');
        const runStub = sandbox.stub(vm, 'runInContext').throws(error);
        createServer();
        await replStartStub.args[0][0].eval('1', ctx, '', cb);
        cb.args[0][0].should.eql(error);
      });
    });
  });
});
