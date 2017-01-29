import parseAsync from '../parse-async';
import Config from '../config';
import * as vm from 'vm';
import * as should from 'should';

describe('Test parse async', function () {
  let ctx;

  beforeEach(function () {
    ctx = vm.createContext();
  });

  context('when useGlobal is false', function () {
    it('should parse Promise.resolve(true)', async function () {
      const result = await parseAsync('await Promise.resolve(true)', ctx);
      result.should.equal('localContext[0]');
      ctx.should.eql({
        localContext: [true]
      });
    });

    it('should parse Promise.all([Promise.resolve(true), Promise.resolve(false)])', async function () {
      const result = await parseAsync('const result = await Promise.all([Promise.resolve(true), Promise.resolve(false)])', ctx);
      result.should.equal('const result = localContext[0]');
      ctx.should.containDeep({
        localContext: [[true, false]]
      });
    });

    it('should parse [await Promise.resolve(true), await Promise.resolve(false)]', async function () {
      const result = await parseAsync('const result = [await Promise.resolve(true), await Promise.resolve(false)]', ctx);
      result.should.equal('const result = [localContext[0], localContext[1]]');
      ctx.should.eql({
        localContext: [true, false]
      });
    });

    it('should parse const a = await Promise.all(Promise.resolve(1), Promise.resolve(2)]), b = Promise.resolve(1)', async function () {
      const result = await parseAsync('const a = await Promise.all([Promise.resolve(1), Promise.resolve(2)]), b = await Promise.resolve(1)'
        , ctx);
      result.should.equal('const a = localContext[0], b = localContext[1]');
      ctx.should.containDeep({
        localContext: [[1, 2], 1]
      });
    });

    it('should parse Promise.reject(true)', async function () {
      const result = await parseAsync('await Promise.reject(true)', ctx);
      result.should.equal('localContext[0]()');
      should.throws(ctx.localContext[0], /true/);
    });
  });

  context('when useGlobal is true', function () {
    before(function () {
      Config.setConfig({ useGlobal: true });
    });

    after(function () {
      Config.setConfig({ useGlobal: false });
    });

    it('should parse Promise.resolve(true)', async function () {
      const result = await parseAsync('await Promise.resolve(true)', ctx);
      result.should.equal('localContext[0]');
      ctx.should.eql({
        localContext: [true]
      });
    });

    it('should parse Promise.reject(true)', async function () {
      const result = await parseAsync('await Promise.reject(true)', ctx);
      result.should.equal('localContext[0]()');
      should.throws(ctx.localContext[0], /true/);
    });
  });

  context('when useAsync is false', function () {
    before(function () {
      Config.setConfig({ useAsync: false });
    });
    after(function () {
      Config.setConfig({ useAsync: true });
    })

    it('should not parse Promise.resolve(true)', async function () {
      const result = await parseAsync('await Promise.resolve(true)', ctx);
      result.should.equal('await Promise.resolve(true)');
      ctx.should.eql({
      });
    });
  });
});
