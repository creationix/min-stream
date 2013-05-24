exports.source = wrapSource;
function wrapSource(fn) {
  fn.push = applyPush;
  fn.pull = applyPull;
  fn.map = applyMap;
  fn.sink = applySink;
  return fn;
};

exports.pull = wrapPull;
function wrapPull(fn) {
  fn.push = addPush;
  fn.pull = addPull
  fn.map = addMap;
  fn.sink = addSink;
  return fn;
};

exports.push = wrapPush;
function wrapPush(push) {
  return wrapPull(pushToPull(push));
};

exports.map = wrapMap;
function wrapMap(map) {
  return wrapPull(mapToPull(map));
};

function applyPull(pull) {
  return wrapSource(pull(this));
}

function applyPush(push) {
  return wrapSource(pushToPull(push)(this));
}

function applyMap(map) {
  return wrapSource(mapToPull(map)(this));
}

function applySink(sink) {
  sink(this);
}

function addPull(pull) {
  var filter = this;
  return wrapPull(function (read) {
    return pull(filter(read));
  });
}

function addPush(push) {
  return addPull.call(this, pushToPull(push));
}

function addMap(map) {
  return addPull.call(this, mapToPull(map));
}

function addSink(sink) {
  var filter = this;
  return function (read) {
    sink(filter(read));
  };
}

exports.mapToPull = mapToPull;
function mapToPull(map) {
  return function (read) {
    return function (close, callback) {
      if (close) return read(close, callback);
      read(null, function (err, item) {
        if (item === undefined) return callback(err);
        try { item = map(item); }
        catch (err) { return callback(err); }
        callback(null, item);
      });
    };
  };
}

exports.pushToPull = pushToPull;
function pushToPull(push) {
  return function (read) {
    var dataQueue = [];
    var readQueue = [];
    var reading = false;
    var write = push(function () {
      dataQueue.push(arguments);
      check();
    });

    function check() {
      while (dataQueue.length && readQueue.length) {
        readQueue.shift().apply(null, dataQueue.shift());
      }
      if (!reading && readQueue.length) {
        reading = true;
        read(null, onRead);
      }
    }

    function onRead(err, item) {
      reading = false;
      write(err, item);
      check();
    }

    return function (close, callback) {
      if (close) return read(close, callback);
      readQueue.push(callback);
      check();
    };
  };
}

