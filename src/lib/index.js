import { createLogger } from 'bunyan'
const should = require('chai').should()

export default function violin(opts) {
  function instrument({ log = createLogger({ name: 'violin_instrument', streams: [ { path: './violin.log' } ] }) } = {}) {
    should.exist(opts.instrument, 'violin: an instrument configuration option must be defined to use instrument()')
    let cancelMemoryPolling = () => {}
    const { memory } = opts.instrument
    if(memory) {
      const { startup, frequency, events } = memory
      const heapdump = require('heapdump')

      let isWriting = false
      let snapshotCount = 0
      function violinSnapshot(snapshotType) {
        if(isWriting) {
          log.warn(`violin: a memory snapshot is still being written, bypassing ${snapshotType} memory snapshot. Consider increasing the snapshot frequency interval.`)
          return
        }
        snapshotCount++
        isWriting = true
        log.info(`violin: ${snapshotType} memory snapshot #${snapshotCount} about to be written.'`)
        heapdump.writeSnapshot(function violinSnapshotComplete(heapErr, filename) {
          if(heapErr)
            log.error(heapErr, `violin: error occurred writing ${snapshotType} memory snapshot #${snapshotCount} at ${filename}.`)
          else
            log.info(`violin: ${snapshotType} memory snapshot #${snapshotCount} written to ${filename}.'`)
          isWriting = false
        })
      }

      if(startup) {
        startup.should.be.a('boolean')
        log.info('violin: writing startup memory snapshot.')
        violinSnapshot('startup')
      }
      if(frequency) {
        frequency.should.be.a('number', 'violin: memory snapshot frequency must be a number')
        const frequencyMinutes = (frequency / (1000 * 60 * 60)).toLocaleString()
        log.info(`violin: starting periodic heapdump snapshots every ${frequencyMinutes} minutes.`)
        let memoryIntervalID = setInterval(function violinFrequencySnapshot() { violinSnapshot('frequency') }, frequency)
        cancelMemoryPolling = () => clearInterval(memoryIntervalID)
      }
      if(events) {
        events.should.be.instanceof(Array)
        log.info({ events }, 'violin: registering heap dump for events.')
        events.forEach(x => {
          should.exist(x, 'violin: each event must exist')
          x.should.be.a('string', 'violin: each event must be a string process eventName')

          if(x === 'uncaughtException') {
            process.on('uncaughtException', function violinUncaughtExceptionSnapshot (err) {
              // prevent infinite recursion
              process.removeListener('uncaughtException', arguments.callee)

              // log the exception
              log.fatal(err, `violin: subscribed instrument memory process event 'uncaughtException' was triggered, snapshot written to ${filename}. exiting...`)
              violinSnapshot('event_uncaughtException')

              if (typeof(log.streams[0]) !== 'object') return

              // throw the original exception once stream is closed
              log.streams[0].stream.on('close', function violinFatalStreamClose (streamErr, stream) {
                throw err
              })

              // close stream, flush buffer to disk
              log.streams[0].stream.end()
            })

          } else {
            process.on(x, function violinEventSnapshot (err) {
              try {
                violinSnapshot(`event_${x}`)
              } catch(err) {
                log.error(err, `violin: an internal error occurred attempting to capture heap dump for event ${x}.`)
              }
            })
          }
        })
      }
    }
    return { cancelMemoryPolling }
  }
  return { instrument }
}

