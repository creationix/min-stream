// Accepts read streams and returns a single composite read stream
// All inputs will be read in parallel.
module.exports = merge;
function merge() {
  var left = arguments.length;
  if (left === 0) return empty;
  if (left === 1) return arguments[0];
  var read;
  var streams = Array.prototype.slice.call(arguments);
  var startRead = streams.map(function (stream, index) {
    var reading = false;
    var done = false;

    function onRead(err, item) {
      reading = false;
      if (item === undefined) {
        done = true;
        if (err) throw new Error("TODO: forward err properly");
        if (!--left) {
          dataQueue.push([]);
          check();
        }
        return;
      }
      dataQueue.push(arguments);
      check();
    }

    return function () {
      if (reading || done) return;
      reading = true;
      stream(null, onRead);
    };
  });
  var dataQueue = [];
  var readQueue = [];

  function check() {
    while (readQueue.length && dataQueue.length) {
      readQueue.shift().apply(null, dataQueue.shift());
    }
    if (readQueue.length) {
      startRead.forEach(call);
    }
  }

  read = function (close, callback) {
    if (close) throw new Error("TODO: Implement close for join read");
    readQueue.push(callback);
    check();
  };
  read.is = "min-stream-read";
  return read;
}

function call(fn) { fn(); }
