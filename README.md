# violin

**Node instrumentation with pre-built node binaries.**

**Internally packages and runs [heapdump](https://npmjs.com/packages/heapdump) so the consumer does not need node-gyp working on their machine.**


[![Build Status](https://travis-ci.org/noderaider/violin.svg?branch=master)](https://travis-ci.org/noderaider/violin)
[![codecov](https://codecov.io/gh/noderaider/violin/branch/master/graph/badge.svg)](https://codecov.io/gh/noderaider/violin)

[![NPM](https://nodei.co/npm/violin.png?stars=true&downloads=true)](https://nodei.co/npm/violin/)


## Install

`npm i -S violin`


## Usage

```js
import violin from 'violin'
import { createLogger } from 'bunyan'

                                        /** Create a memory dump on startup */
const opts =  { instrument: { memory: { startup: true
                                        /** Create a memory dump every 4 hours */
                                      , frequency: 14400000
                                        /** Create a memory dump whenever any of these process.on events occur */
                                      , events: [ 'uncaughtException' ]
                                      }
                            }
              }

const { instrument } = violin(opts)

/** Start instrumenting memory per above options */
instrument()
```

---


## TEST

**Unit tests output for current release:**

# TOC
   - [lib](#lib)
     - [#default](#lib-default)
     - [violin](#lib-violin)
       - [#instrument](#lib-violin-instrument)
<a name=""></a>

<a name="lib"></a>
# lib
<a name="lib-default"></a>
## #default
should have default function export.

```js
return should.exist(lib.default);
```

<a name="lib-violin"></a>
## violin
should be a function.

```js
return violin.should.be.a('function');
```

<a name="lib-violin-instrument"></a>
### #instrument
should return an instrument object.

```js
return violin().should.be.an('object').that.has.property('instrument');
```

should not throw for valid opts.

```js
return function () {
  return violin(opts).instrument();
}.should.not.throw();
```

