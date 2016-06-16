'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = violin;
var should = require('chai').should();

function violin(opts) {
  function instrument() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$tracing = _ref.tracing;
    var tracing = _ref$tracing === undefined ? false : _ref$tracing;
    var _ref$logger = _ref.logger;
    var logger = _ref$logger === undefined ? console : _ref$logger;
    var _ref$logLevel = _ref.logLevel;
    var logLevel = _ref$logLevel === undefined ? 'info' : _ref$logLevel;

    var log = function log() {
      return tracing ? logger[logLevel].apply(logger, arguments) : function () {};
    };
    should.exist(opts.instrument, 'an instrument configuration option must be defined to use instrument()');
    var cancelMemoryPolling = function cancelMemoryPolling() {};
    var memory = opts.instrument.memory;

    if (memory) {
      (function () {
        var startup = memory.startup;
        var frequency = memory.frequency;
        var events = memory.events;

        var heapdump = require('heapdump');
        if (startup) {
          startup.should.be.a('boolean');
          log('writing startup periodic heapdump.');
          heapdump.writeSnapshot(function (heapErr, filename) {
            if (heapErr) logger.error({ err: heapErr }, 'error occurred writing startup heap at ' + filename + '.');else log('startup periodic heapdump written to ' + filename + '.\'');
          });
        }
        if (frequency) {
          (function () {
            frequency.should.be.a('number');
            var periodicCount = 0;
            var frequencyMinutes = (frequency / (1000 * 60 * 60)).toLocaleString();
            log('starting periodic heapdump snapshots every ' + frequencyMinutes + ' minutes.');
            var memoryIntervalID = setInterval(function () {
              return heapdump.writeSnapshot(function (heapErr, filename) {
                periodicCount++;
                if (heapErr) logger.error({ err: heapErr }, 'error occurred writing heap at ' + filename + '.');else log('periodic heapdump ' + periodicCount + ' written to ' + filename + ' (every ' + frequencyMinutes + ' minutes).\'');
              });
            }, frequency);
            cancelMemoryPolling = function cancelMemoryPolling() {
              return clearInterval(memoryIntervalID);
            };
          })();
        }
        if (events) {
          Array.isArray(events).should.be.true;
          log({ events: events }, 'registering heap dump for events.');
          events.forEach(function (x) {
            should.exist(x, 'each event must exist');
            x.should.be.a('string', 'each event must be a string eventName');

            process.on(x, function (err) {
              try {
                heapdump.writeSnapshot(function (heapErr, filename) {
                  if (heapErr) {
                    log({ err: heapErr }, 'error occurred writing heap at ' + filename);
                  } else if (x === 'uncaughtException') {
                    logger.fatal({ err: err }, 'subscribed instrument memory process event \'uncaughtException\' was triggered, snapshot written to ' + filename + '. exiting...');
                    process.exit(1);
                  } else {
                    log('heapdump written to ' + filename + ' for subscribed memory process event \'' + x + '\'');
                  }
                });
              } catch (err) {
                console.error(err, 'HEAPDUMP_ERROR: An error occurred attempting to capture heap dump.');
              }
            });
          });
        }
      })();
    }
    return { cancelMemoryPolling: cancelMemoryPolling };
  }
  return { instrument: instrument };
}