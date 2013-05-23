module.exports = arrayToSource
function arrayToSource(array) {
  var index = 0;
  return function (close, callback) {
    if (close) return callback(close === true ? undefined : close);
    callback(null, array[index++]);
  };
}

arrayToSource.async = arrayToAsyncSource;
function arrayToAsyncSource(array) {
  var index = 0;
  return function (close, callback) {
    setTimeout(function () {
      if (close) return callback(close === true ? undefined : close);
      callback(null, array[index++]);
    }, Math.random() * 10);
  };
}
