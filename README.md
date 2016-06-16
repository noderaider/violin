# violin

**Instrumentation with pre-built node binaries.**


[![Build Status](https://travis-ci.org/noderaider/violin.svg?branch=master)](https://travis-ci.org/noderaider/violin)
[![codecov](https://codecov.io/gh/noderaider/violin/branch/master/graph/badge.svg)](https://codecov.io/gh/noderaider/violin)

[![NPM](https://nodei.co/npm/violin.png?stars=true&downloads=true)](https://nodei.co/npm/violin/)


## Install

`npm i -S violin`


**This project is in active development. Please come back in a couple of weeks.**

---


## TEST

**Unit tests output for current release:**

# TOC
   - [lib](#lib)
     - [#default](#lib-default)
     - [violin](#lib-violin)
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

