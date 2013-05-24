// Consume a stream, outputing all the events as an array
// callback is called once the stream outputs undefined for item.
// If there was an error, then it will be passed to the callback.
// callback(err, items);
module.exports = consume;
function consume(read, callback) {
  var items = [];
  var sync;
  start();
  function start() {
    do {
      sync = undefined;
      read(null, onRead);
      if (sync === undefined) sync = false;
    } while (sync);
  }
  function onRead(err, item) {
    if (item === undefined) return callback(err, items);
    items.push(item);
    if (sync === undefined) sync = true;
    else start();
  }
}

// Consume an array of object full of streams.  Call callback when all are done.
consume.all = consumeAll;
function consumeAll(sources, callback) {
  var result = Array.isArray(sources) ? [] : {};
  var names = Array.isArray(sources) ? arrayKeys(sources) : Object.keys(sources);
  var left = names.length;
  var done;
  names.forEach(function (name) {
    consume(sources[name], function (err, items) {
      if (done) return;
      if (err) {
        done = true;
        return callback(err);
      }
      result[name] = items;
      if (!--left) {
        done = true;
        callback(null, result);
      }
    });
  });
}

consume.sink = consumeSink;
function consumeSink(callback) {
  return function (read) {
    consume(read, callback);
  };
}

function arrayKeys(array) {
  var length = array.length;
  var keys = new Array(length);
  for (var i = 0; i < length; i++) {
    keys[i] = i;
  }
  return keys;
}
