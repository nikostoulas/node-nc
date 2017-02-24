import Config from '../config';
import {
  getParams,
  getFnStr,
  getFn,
  functionToParams,
  print,
  default as suggest
} from '../suggestions';
import * as suggestions from '../suggestions';
import * as vm from 'vm';
import * as sinon from 'sinon';
const sandbox = sinon.sandbox.create();

describe('Test Suggestions', function () {
  let ctx;

  beforeEach(function () {
    ctx = vm.createContext();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('Test getParams', function () {
    it('should get params from simple function', function () {
      function simple(a, b, c) { return; }
      getParams(simple).should.eql(['a', 'b', 'c']);
    });

    it('should get params from simple function with destructuring comments and defaults', function () {
      function simple(a = 'a'/*comments*/, /* comments*/{b}) { return; }
      getParams(simple).should.eql(['a=\'a\'', '{b}']);
    });

    it('should get params from arrow function', function () {
      const arrow = (a, {b}, c = 'c') => { return; };
      getParams(arrow).should.eql(['a', '{b}', 'c=\'c\'']);
    });

    it.skip('should get params from arrow function without parentheses', function () {
      const arrow = a => { return; };
      getParams(arrow).should.eql(['a']);
    });

    it('should get params from class constructor', function () {
      class Test {
        constructor(a, {b}, c = 'c') {
          return;
        }
      }
      getParams(Test).should.eql(['a', '{b}', 'c=\'c\'']);
    });

    it('should get params from parent class', function () {
      class Test {
        constructor(a, {b}, c = 'c') {
          return;
        }
      }

      class Child extends Test {
      }

      getParams(Child).should.eql(['a', '{b}', 'c=\'c\'']);
    });
  });

  describe('Test getFnStr', function () {
    it('should correctly extract functions from strings', function () {
      const stmnts = [
        'const a = fn(',
        'const b = a.fn(',
        'const c = a(1, 2).fn(',
        'const d = a[0].fn(',
        'const e =  [1, 2, 3].slice(',
        'const f = new AndoBridge(1, 2).fn('
      ];
      stmnts
        .map(stmnt => getFnStr(stmnt))
        .should.eql([
          'fn',
          'a.fn',
          'a(1, 2).fn',
          'a[0].fn',
          '[1, 2, 3].slice',
          'new AndoBridge(1, 2).fn'
        ]);
    });

    it('should correctly extract functions from strings with params', function () {
      const stmnts = [
        'const a = fn(a,b',
        'const b = a.fn(a,b',
        'const c = a(1, 2).fn(a, b',
        'const d = a[0].fn(a, b, [c]',
        'const e = [1, 2, 3].slice(a, b, [c]',
        'const f = new AndoBridge(1, 2).fn( a, b'
      ];
      stmnts
        .map(stmnt => getFnStr(stmnt))
        .should.eql([
          'fn',
          'a.fn',
          'a(1, 2).fn',
          'a[0].fn',
          '[1, 2, 3].slice',
          'new AndoBridge(1, 2).fn'
        ]);
    });
  });

  it('should not match complete statements', function () {
    const stmnts = [
      'const a = fn()',
      'const b = a.fn()',
      'const c = a().fn()',
      'const d = a[0].fn()'
    ];
    stmnts
      .map(stmnt => getFnStr(stmnt))
      .should.eql([
        undefined,
        undefined,
        undefined,
        undefined
      ]);
  });

  describe('Test getFn', function () {
    context('when useGlobal is true', function () {
      before(function () {
        Config.setConfig({ useGlobal: true });
      });

      after(function () {
        Config.setConfig({ useGlobal: false });
      });

      it('should run command', function () {
        function test() { return; };
        (<any>global).test = test;
        getFn('test', ctx).should.eql(test);
        delete (<any>global).test;
      });
    });

    context('when useGlobal is false', function () {
      it('should run command', function () {
        function test() { return; };
        ctx.test = test;
        getFn('test', ctx).should.eql(test);
      });
    });
  });

  describe('Test functionToParams', function () {
    it('should parse function with params', function () {
      function test(a, b) { return; }
      ctx.test = test;
      functionToParams('test(', ctx).should.eql('(a, b)');
    });

    it('should parse function with no params', function () {
      function test() { return; }
      ctx.test = test;
      functionToParams('test(', ctx).should.eql('()');
    });

    it('should parse arrow function', function () {
      const test = a => { return; }
      ctx.test = test;
      functionToParams('test(', ctx).should.eql('');
    });
  });

  describe('Test print', function () {
    it('should call process stdout functions', function () {
      const cursorToStub = sandbox.stub(process.stdout, 'cursorTo');
      const writeStub = sandbox.stub(process.stdout, 'write');
      const clearLineStub = sandbox.stub(process.stdout, 'clearLine');
      const moveCursorStub = sandbox.stub(process.stdout, 'moveCursor');
      print('test', 10, 5);
      cursorToStub.args.should.eql([
        [10],
        [5]
      ]);
      writeStub.args.should.eql([
        ['        \x1b[2m\x1b[37mtest\x1b[0m']
      ]);
      moveCursorStub.args.should.eql([
        [-13]
      ]);
    });
  });

  describe('Test suggest', function () {
    it('should call print with output of functionToParams', function () {
      const cursorToStub = sandbox.stub(process.stdout, 'cursorTo');
      const writeStub = sandbox.stub(process.stdout, 'write');
      const clearLineStub = sandbox.stub(process.stdout, 'clearLine');
      const moveCursorStub = sandbox.stub(process.stdout, 'moveCursor');
      const server = { input: { on: sandbox.stub() }, context: ctx, line: '"a".toString(', columns: 90, cursor: 10 };
      suggest(server);
      server.input.on.calledOnce.should.be.true();
      server.input.on.args[0][1]('test(');
      writeStub.args.should.eql([
        ['        \u001b[2m\u001b[37m()\u001b[0m']
      ]);
    });

    it('should call print with error', function () {
      const cursorToStub = sandbox.stub(process.stdout, 'cursorTo');
      const writeStub = sandbox.stub(process.stdout, 'write');
      const clearLineStub = sandbox.stub(process.stdout, 'clearLine');
      const moveCursorStub = sandbox.stub(process.stdout, 'moveCursor');
      const server = { input: { on: sandbox.stub() }, context: ctx, line: 'a.toString(', columns: 90, cursor: 10 };
      suggest(server);
      server.input.on.calledOnce.should.be.true();
      server.input.on.args[0][1]('test(');
      writeStub.args.should.eql([
        ['        \u001b[2m\u001b[37ma is not defined\u001b[0m']
      ]);
    });

    it('should do nothing', function () {
      const cursorToStub = sandbox.stub(process.stdout, 'cursorTo');
      const writeStub = sandbox.stub(process.stdout, 'write');
      const clearLineStub = sandbox.stub(process.stdout, 'clearLine');
      const moveCursorStub = sandbox.stub(process.stdout, 'moveCursor');
      const server = { input: { on: sandbox.stub() }, context: ctx, line: 'a.toString', columns: 90, cursor: 10 };
      suggest(server);
      server.input.on.calledOnce.should.be.true();
      server.input.on.args[0][1]('test(');
      writeStub.called.should.be.false();
    });
  });
});
