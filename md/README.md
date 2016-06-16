# violin

**Node instrumentation with pre-built node binaries.**


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
instrument( { tracing: true
            , logger = createLogger({ name: 'instrument' })
            , logLevel: 'info'
            } )
```
