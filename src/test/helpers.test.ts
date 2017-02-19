import {
  compact,
  convertBoolean,
  uniqueKeepLatest,
  camelCase
} from '../helpers';

describe('Test helpers', function () {
  describe('Test compact', function () {
    it('should remove undefined high level keys', function () {
      compact({
        one: 1,
        two: '2',
        three: null,
        four: undefined,
        five: {
          nested: undefined
        }
      }).should.eql({
        one: 1,
        two: '2',
        three: null,
        five: {
          nested: undefined
        }
      });
    });
  });

  describe('Test convertBoolean', function () {
    it('should convert string values to boolean', function () {
      convertBoolean({
        one: 1,
        true: 'true',
        false: 'false'
      }).should.eql({
        one: 1,
        true: true,
        false: false
      });
    });
  });

  describe('Test uniqueKeepLatest', function () {
    it('should keep last unique value from array', function () {
      uniqueKeepLatest([
        'one',
        'two',
        'one',
        'three',
        'three'
      ]).should.eql([
        'two',
        'one',
        'three'
      ]);
    });
  });

  describe('Test camelcase', function () {
    it('should camelCase string that has dashes', function () {
      camelCase('a-b-c-d-e').should.equal('aBCDE');
      camelCase('a-bc-de').should.equal('aBcDe');
    });
  });
});
