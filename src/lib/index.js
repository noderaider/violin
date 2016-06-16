const should = require('chai').should()

export default function violin(opts) {
  function instrument({ tracing = false, logger = console, logLevel = 'info' } = {}) {
    const log = (...args) => tracing ? logger[logLevel](...args) : () => {}
    should.exist(opts.instrument, 'an instrument configuration option must be defined to use instrument()')
    let cancelMemoryPolling = () => {}
    const { memory } = opts.instrument
    if(memory) {
      const { startup, frequency, events } = memory
      const heapdump = require('heapdump')
      if(startup) {
        startup.should.be.a('boolean')
        log('writing startup periodic heapdump.')
        heapdump.writeSnapshot((heapErr, filename) => {
          if(heapErr)
            logger.error({ err: heapErr }, `error occurred writing startup heap at ${filename}.`)
          else
            log(`startup periodic heapdump written to ${filename}.'`)
        })
      }
      if(frequency) {
        frequency.should.be.a('number')
        let periodicCount = 0
        const frequencyMinutes = (frequency / (1000 * 60 * 60)).toLocaleString()
        log(`starting periodic heapdump snapshots every ${frequencyMinutes} minutes.`)
        let memoryIntervalID = setInterval(() => heapdump.writeSnapshot((heapErr, filename) => {
          periodicCount++
          if(heapErr)
            logger.error({ err: heapErr }, `error occurred writing heap at ${filename}.`)
          else
            log(`periodic heapdump ${periodicCount} written to ${filename} (every ${frequencyMinutes} minutes).'`)
        }), frequency)
        cancelMemoryPolling = () => clearInterval(memoryIntervalID)
      }
      if(events) {
        Array.isArray(events).should.be.true
        log({ events }, 'registering heap dump for events.')
        events.forEach(x => {
          should.exist(x, 'each event must exist')
          x.should.be.a('string', 'each event must be a string eventName')

          process.on(x, err => {
            try {
              heapdump.writeSnapshot((heapErr, filename) => {
                if(heapErr) {
                  log({ err: heapErr }, `error occurred writing heap at ${filename}`)
                } else if(x === 'uncaughtException') {
                  logger.fatal({ err }, `subscribed instrument memory process event 'uncaughtException' was triggered, snapshot written to ${filename}. exiting...`)
                  process.exit(1)
                } else {
                  log(`heapdump written to ${filename} for subscribed memory process event '${x}'`)
                }
              })
            } catch(err) {
              console.error(err, 'HEAPDUMP_ERROR: An error occurred attempting to capture heap dump.')
            }
          })
        })
      }
    }
    return { cancelMemoryPolling }
  }
  return { instrument }
}
