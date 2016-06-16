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

