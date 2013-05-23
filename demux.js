// input stream (read) is arrays with [name, value] format.
// output is several streams by name. {name1:stream1, name2:stream2, ...}
// names is an array of names to pull out.
// if names is a number, then an array is retured [stream1, stream2]
// and "names" is assumed to be numbers 0 to n - 1
// the filter does not buffer, so all requested streams must have sinks.
module.exports = demux;
function demux(names, read) {
  var reading = false;
  var dataQueues = {};
  var readQueues = {};
  var sources;
  if (typeof names === "number") {
    var num = names;
    sources = new Array(num);
    names = [];
    for (var i = 0; i < num; i++) {
      names[i] = i;
    }
  }
  else {
    sources = {};
  }

  // Returns true if there is at least one reader in any of the readQueues
  function hasReaders() {
    var names = Object.keys(readQueues);
    for (var i = 0, l = names.length; i < l; i++) {
      if (readQueues[names[i]].length > 0) return true;
    }
    return false;
  }

  function hasData() {
    var names = Object.keys(dataQueues);
    for (var i = 0, l = names.length; i < l; i++) {
      if (dataQueues[names[i]].length > 0) return true;
    }
    return false;
  }

  function check(name) {
    var dataQueue = dataQueues[name] || (dataQueues[name] = []);
    var readQueue = readQueues[name];
    while (dataQueue.length && readQueue.length) {
      readQueue.shift().apply(null, dataQueue.shift());
    }

    // Look for any pending readers
    if (!reading && !hasData() && hasReaders()) {
      reading = true;
      read(null, onRead);
    }

  }

  function onRead(err, item) {
    reading = false;
    if (item === undefined) {
      // Copy end and error to everyone.
      Object.keys(readQueues).forEach(function (name) {
        var dataQueue = dataQueues[name] || (dataQueues[name] = []);
        dataQueue.push([err]);
      });
      Object.keys(readQueues).forEach(check);
      return;
    }
    var name = item[0];
    if (readQueues[name]) {
      // Only store known message types
      var dataQueue = dataQueues[name] || (dataQueues[name] = []);
      dataQueue.push([null, item[1]]);
    }
    check(name);
  }

  names.forEach(function (name) {
    var readQueue = readQueues[name] = [];
    sources[name] = function (close, callback) {
      if (close) {
        throw new Error("TODO: Implement demultiplex close");
      }
      readQueue.push(callback);
      check(name);
    };
    sources[name].is = "min-stream-read";
  });

  return sources;
}
