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
  // Otherwise some data and when ready callback(err, item)
  // DATA is encoded as (falsy, item)
  // END is encoded as (anything, undefined) or (anything) or ()
  // ERROR is a special end (err, undefined) or (err)
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

## This Library

Now that you know what min-streams are, you'll find that working with them directly is sometimes challenging.  Their goal was to be minimal and easy to implement.  This library makes them easy to use and very powerful as well!

### pipe

TODO: document the pipe module.

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

