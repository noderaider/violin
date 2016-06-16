import rewire from 'rewire'
const should = require('chai').should()

describe('lib', function() {
  const lib = rewire('../lib')

  describe('#default', function () {
    it('should have default function export', () => should.exist(lib.default))
  })

  const violin = lib.default
  describe('violin', function () {
    it('should be a function', () => violin.should.be.a('function'))

    describe('#instrument', function () {
      it('should return an instrument object', () => violin().should.be.an('object').that.has.property('instrument'))

      const opts =  { instrument: { memory: { startup: true
                                              /** Create a memory dump every 4 hours */
                                            , frequency: 14400000
                                              /** Create a memory dump whenever any of these process.on events occur */
                                            , events: [ 'uncaughtException' ]
                                            }
                                  }
                    }
      it('should not throw for valid opts', () => (() => violin(opts).instrument()).should.not.throw())
    })
  })
})
