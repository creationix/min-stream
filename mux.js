// streams is an array or object of streams
// They are multiplexed by the keys (indexes in case of array)
// output is stream of arrays [name, item];
module.exports = mux;
function mux(streams) {
  var names = Array.isArray(streams) ? arrayKeys(streams) : Object.keys(streams);
  var startRead = {};
  var left = names.length;
  names.forEach(function (name) {
    var reading = false;
    var closed = false;
    function onRead(err, item) {
      reading = false;
      if (closed) return;
      if (item === undefined) {
        // TODO: close other sources on error
        closed = true;
        if (!--left) {
          dataQueue.push([]);
          check();
        }
        return;
      }
      dataQueue.push([null, [name, item]]);
      check();
    }
    startRead[name] = function () {
      if (reading) return;
      reading = true;
      streams[name](null, onRead);
    };
  });
  function start(name) {
    startRead[name]();
  }

  var dataQueue = [];
  var readQueue = [];

  function check() {
    while (dataQueue.length && readQueue.length) {
      readQueue.shift().apply(null, dataQueue.shift());
    }
    if (readQueue.length) {
      names.forEach(start);
    }
  }

  var read = function (close, callback) {
    if (close) throw new Error("TODO: Implement close logic");
    readQueue.push(callback);
    check();
  }
  read.is = "min-stream-read";
  return read;
}
