var consume = require('../consume.js');
var test = require('tape');

test("consume should convert a stream to an array", function (assert) {
  consume(counter(5), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, [0,1,2,3,4]);
    assert.end();
  });
});

test("consume all should handle an array of streams", function (assert) {
  consume.all([
    counter(5),
    counter(3),
    counter(4)
  ], function (err, result) {
    if (err) throw err;
    assert.deepEqual(result, [
      [0,1,2,3,4],
      [0,1,2],
      [0,1,2,3]
    ]);
    assert.end();
  });
});

test("consume all should handle a hash of streams", function (assert) {
  consume.all({
    big: counter(5),
    tiny: counter(3),
    med: counter(4)
  }, function (err, result) {
    if (err) throw err;
    assert.deepEqual(result, {
      big: [0,1,2,3,4],
      tiny: [0,1,2],
      med: [0,1,2,3]
    });
    assert.end();
  });
});

test("consume should also work in sink mode", function (assert) {
  consume.sink(ondone)(counter(10));

  function ondone(err, result) {
    if (err) throw err;
    assert.deepEqual(result, [0,1,2,3,4,5,6,7,8,9]);
    assert.end();
  }
});


// A source generator, counts from 0 to n - 1
function counter(n) {
  var i = 0;
  return function (close, callback) {
    if (close) callbacl(close === true ? null : close);
    else if (i < n) callback(null, i++);
    else callback();
  };
}
