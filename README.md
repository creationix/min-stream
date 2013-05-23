min-stream
==========

[![node support](https://travis-ci.org/creationix/min-stream.png)](https://travis-ci.org/creationix/min-stream)

[![browser support](https://ci.testling.com/creationix/min-stream.png)](https://ci.testling.com/creationix/min-stream)


A meta-package for min-stream helper modules.  This contains several useful and related modules for working with min-streams.  Note that implementations of min-stream should not need to depend on this library.

## The Interface

The min-stream system is an interface more than anything.  This has three main types: sources, filters, and sinks.

### Source

TODO: Explain source

### Filter

TODO: Explain filter

### Sink

TODO: Explain sink.

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

