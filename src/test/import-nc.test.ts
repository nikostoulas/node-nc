import importNc from '../import-nc';
import * as sinon from 'sinon';
const sandbox = sinon.createSandbox();
import * as fs from 'fs';
import * as should from 'should';

describe('test import-nc', function () {
  afterEach(function () {
    sandbox.restore();
  });

  it('should ', function () {
    sandbox.stub(fs, 'existsSync').returns(true);
    should.throws(importNc);
  });
});
