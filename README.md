min-stream
==========

[![node support](https://travis-ci.org/creationix/min-stream.png)](https://travis-ci.org/creationix/min-stream)

[![browser support](https://ci.testling.com/creationix/min-stream.png)](https://ci.testling.com/creationix/min-stream)


A meta-package for min-stream helper modules.  This contains several useful and related modules for working with min-streams.  Note that implementations of min-stream should not need to depend on this library.

## The Interface

The min-stream system is an interface more than anything.  This has three main types: sources, filters, and sinks.

### Source

A source is a place where data comes from.  Since this is a pull-stream system, it's the place we pull data from.  It has the JavaScript signature:

```js
function read(close, callback) {
  // If close is truthy, that means to clean up any resources and close the stream
  // call callback with an END event when done.
  // Otherwise, get some data and when ready, callback(err, item)
  // DATA  is encoded as (falsy, item)
  // END   is encoded as (falsy, undefined) or (falsy) or ()
  // ERROR is encoded as (err, undefined)   or (err)
}
```

Sources are usually things like the readable end of TCP sockets and readable file streams.  They can really be anything that emits events in a stream though.

### Filter

A filter is a function that accepts a source and returns a new transformed source.  This is where protocols are implemented.  It has the signature:

```js
function filter(read) {
  // Set up per-stream state here
  return function (close, callback) {
    // Handle per event logic here, reading from upstream `read` when needed.
    // Close is often just forwarded to the upstream `read`.
  };
}
```

There are also technically two other filter types supported by the `chain` helper described later on.  They are regular map functions and push filters.  They have less power than normal pull filters; but are in many cases much easier to write.

### Sink

A sink represents something like the writable end of a TCP socket or a writable file.  You can't write directly to it.  Rather, you hand it a source function and it pulls at the rate it can handle.  This way backpressure works automatically without having to deal with pause, resume, drain, and ready.

```js
// Usage is simple.
sink(source);
```

Or in the likely case you have a filter

```js
sink(
  filter(
    source
  )
);
```

## This Library

Now that you know what min-streams are, you'll find that working with them directly is sometimes challenging.  Their goal was to be minimal and easy to implement.  This library makes them easy to use and very powerful as well!

### Chain

Manually connecting sink to filter to source ends up being a reverse pyramid.  Often it's preferred to write it as a chain from source to sink in the same direction the data flows.

The `chain` module helps with this.  Here is a simple example.

```js
chain
  .source(socket.source)
  .pull(myapp)
  .sink(socket.sink);

function myapp(read) {
  return function (close, callback) {
    // Implement app logic as pull filter...
  };
}
```

#### chain.source(source) -> source

Wrap a source function adding in the `pull`, `push`, `map`, and `sink` methods.

Returns the function for easy chaining.

#### chain.pull(pull) -> pull

Wrap a pull filter by adding in the `pull`, `push`, `map`, and `sink` methods.

Returns the function for easy chaining.

#### chain.push(push) -> pull

Wrap a push filter, converting it to a pull filter.  Push filters accept an emit function and return a new emit function.  There is no way to control back-pressure from within a push filter.  Also close events skip push filters.

```js
function (emit) {
  // Set up per-stream state
  return function (err, item) {
    // handle this event and call `emit` 0 or more times as required by protocol.
  };
}
```

#### chain.map(map) -> pull

Wrap a map function, converting it to a pull filter.  Map functions can't see backpressure, close events, or even end or error events.  They only see items.  Map functions are stateless.  If they throw an exception it will be caught and sent as an error event.

```js
function (item) {
  // return transformed item.
}
```

Existing examples of map functions are `JSON.stringify` and `JSON.parse`.


#### source.pull(pull) -> source, source.push(push) -> source, source.map(map) -> source

When chaining off a wrapped source, you can add pull, push, or map filters and a new wrapped source will be returned every time.

```js
var parsedSource = chain
  .source(socket.source)
  .push(deframer)
  .map(JSON.parse);
```

#### source.sink(sink)

Attaching a sink to a source completes the chain and starts the action.  Doesn't return anything and can't be chained from.

```js
chain
  .source(file.source)
  .map(capitalize)
  .sink(file.sink);
```

#### pull.pull(pull) -> pull, pull.push(push) -> pull, pull.map(map) -> pull

When chaining off a wrapped pull filter, you can add pull, push, or map filters and a new composite and wrapped pull filter will be returned.

```js
var combined = chain
  .push(pushFilter)
  .map(myMap);
```

#### pull.sink(sink) -> sink

A composite sink can be built by chaining a sink call from a wrapped pull filter.

```js
var newsink = chain
  .map(JSON.stringify)
  .sink(socket.sink);
```

### cat

TODO: document the cat module.

### merge

TODO: document the merge module.

### dup

TODO: document the dup module.

### mux

TODO: document the mux module.

### demux

TODO: document the demux module.

## Related packages

TODO: Hyperlink these projects or move to wiki.

There are many packaged and modules out there that implement this interface.  Some interesting ones are:

 - min-stream-node - A node.js adapter that provides tcp client and server as well as file streams using min-streams.
 - min-stream-uv - A crazy experiment to implement the same interface as min-stream-node, but using node's private internal libuv bindings for maximum speed and unstability.
 - min-stream-chrome - Another implementation of the tcp and fs API, but wrapping chrome packaged apps's special APIs.
 - min-stream-http-codec - A set of filters that makes implementing HTTP server and client programs easy on top of the tcp adapters.
 - js-git - The project that started all this.  An implementation of git in JavaScript.  Uses min-streams throughout.

