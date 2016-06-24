'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = violin;

var _bunyan = require('bunyan');

var should = require('chai').should();

function violin(opts) {
  function instrument() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$log = _ref.log;
    var log = _ref$log === undefined ? (0, _bunyan.createLogger)({ name: 'violin_instrument', streams: [{ path: './violin.log' }] }) : _ref$log;

    should.exist(opts.instrument, 'violin: an instrument configuration option must be defined to use instrument()');
    var cancelMemoryPolling = function cancelMemoryPolling() {};
    var memory = opts.instrument.memory;

    if (memory) {
      (function () {
        var violinSnapshot = function violinSnapshot(snapshotType) {
          if (isWriting) {
            log.warn('violin: a memory snapshot is still being written, bypassing ' + snapshotType + ' memory snapshot. Consider increasing the snapshot frequency interval.');
            return;
          }
          snapshotCount++;
          isWriting = true;
          log.info('violin: ' + snapshotType + ' memory snapshot #' + snapshotCount + ' about to be written.\'');
          heapdump.writeSnapshot(function violinSnapshotComplete(heapErr, filename) {
            if (heapErr) log.error(heapErr, 'violin: error occurred writing ' + snapshotType + ' memory snapshot #' + snapshotCount + ' at ' + filename + '.');else log.info('violin: ' + snapshotType + ' memory snapshot #' + snapshotCount + ' written to ' + filename + '.\'');
            isWriting = false;
          });
        };

        var startup = memory.startup;
        var frequency = memory.frequency;
        var events = memory.events;

        var heapdump = require('heapdump');

        var isWriting = false;
        var snapshotCount = 0;


        if (startup) {
          startup.should.be.a('boolean');
          log.info('violin: writing startup memory snapshot.');
          violinSnapshot('startup');
        }
        if (frequency) {
          (function () {
            frequency.should.be.a('number', 'violin: memory snapshot frequency must be a number');
            var frequencyMinutes = (frequency / (1000 * 60)).toLocaleString();
            log.info('violin: starting periodic heapdump snapshots every ' + frequencyMinutes + ' minutes.');
            var memoryIntervalID = setInterval(function violinFrequencySnapshot() {
              violinSnapshot('frequency');
            }, frequency);
            cancelMemoryPolling = function cancelMemoryPolling() {
              return clearInterval(memoryIntervalID);
            };
          })();
        }
        if (events) {
          events.should.be.instanceof(Array);
          log.info({ events: events }, 'violin: registering heap dump for events.');
          events.forEach(function (x) {
            should.exist(x, 'violin: each event must exist');
            x.should.be.a('string', 'violin: each event must be a string process eventName');

            if (x === 'uncaughtException') {
              process.on('uncaughtException', function violinUncaughtExceptionSnapshot(err) {
                // log the exception
                log.fatal(err, 'violin: an "uncaughtException" event was triggered. Writing a snapshot and rethrowing...');
                violinSnapshot('event_uncaughtException');

                if (_typeof(log.streams[0]) !== 'object') return;

                // throw the original exception once stream is closed
                log.streams[0].stream.on('close', function violinFatalStreamClose(streamErr, stream) {
                  throw err;
                });

                // close stream, flush buffer to disk
                log.streams[0].stream.end();
              });
            } else {
              process.on(x, function violinEventSnapshot(err) {
                try {
                  violinSnapshot('event_' + x);
                } catch (err) {
                  log.error(err, 'violin: an internal error occurred attempting to capture heap dump for event ' + x + '.');
                }
              });
            }
          });
        }
      })();
    }
    return { cancelMemoryPolling: cancelMemoryPolling };
  }
  return { instrument: instrument };
}