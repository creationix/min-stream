// Accepts read streams (or arrays) and returns a single composite read stream
// All inputs will be read in serial.
module.exports = cat;
function cat() {
  if (arguments.length === 0) return empty;
  var args = arguments;
  var num = arguments.length;
  var index = 0;
  var reading = false;

  var dataQueue = [];
  var readQueue = [];

  function next() {
    if (reading) return;
    if (index === num) {
      dataQueue.push([]);
      return true;
    }
    var current = args[index];
    if (Array.isArray(current)) {
      current.forEach(addItem);
      index++;
      return true;
    }
    reading = true;
    current(null, onRead);
  }

  function onRead(err, item) {
    reading = false;
    if (item === undefined) {
      if (err) throw new Error("Handle error");
      index++;
    }
    else {
      dataQueue.push(arguments);
    }
    check();
  }

  function addItem(item) {
    dataQueue.push([null, item]);
  }

  function check() {
    do {
      while (readQueue.length && dataQueue.length) {
        readQueue.shift().apply(null, dataQueue.shift());
      }
    } while (readQueue.length && next());
  }

  var read = function (close, callback) {
    if (close) throw new Error("TODO: Implement close for cat read");
    readQueue.push(callback);
    check();
  }
  return read;
}

function empty(close, callback) {
  callback(close === true ? null : close);
}
