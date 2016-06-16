import rewire from 'rewire'
const should = require('chai').should()

describe('lib', function() {
  const lib = rewire('../lib')

  describe('#default', function () {
    it('should have default function export', () => should.exist(lib.default))
  })

  const violin = lib.default
  describe('violin', function() {
    it('should be a function', violin.should.be.a('function'))

  })

})
