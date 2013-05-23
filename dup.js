// Accepts a number of duplicates to make and a single read stream
// returns an array of cloned read streams.
module.exports = dup;
function dup(num, stream) {
  var data;
  var reading = false;
  var streams = new Array(num);
  var readQueues = new Array(num);
  var numReaders = 0;
  for (var i = 0; i < num; i++) {
    streams[i] = create(i);
  }
  function check() {
    while (data && numReaders === num) {
      var args = data;
      data = undefined;
      var readers = new Array(num);
      for (var i = 0; i < num; i++) {
        readers[i] = readQueues[i].shift();
        if (!readQueues[i].length) numReaders--;
      }
      readers.forEach(function (callback) {
        callback.apply(null, args);
      });
    }
    if (!reading && !data && numReaders > 1) {
      reading = true;
      stream(null, onRead);
    }
  }
  function onRead() {
    reading = false;
    data = arguments;
    check();
  }
  function create(i) {
    var readQueue = readQueues[i] = [];
    var read = function (close, callback) {
      if (close) throw new Error("TODO: Implement close for dup");
      if (!readQueue.length) numReaders++;
      readQueue.push(callback);
      check();
    };
    read.is = "min-stream-read";
    return read;
  }

  return streams;
}

