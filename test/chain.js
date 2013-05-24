var chain = require('../chain.js');
var consume = require('../consume.js');
var test = require('tape');

var r1 = ['0','1','2','3','4','5'];
var r2 = [1,-1,3,-3,5,-5];

test("chain should link steps and wrap map function", function (assert) {
  chain
    .source(counter(6))
    .map(JSON.stringify)
    .sink(function (read) {
      consume(read, ondone)
    });

  function ondone(err, items) {
    if (err) throw err;
    assert.deepEqual(items, r1);
    assert.end();
  }
});

test("chain should link steps and wrap push filter", function (assert) {
  chain
    .source(counter(6))
    .push(oddity)
    .sink(function (read) {
      consume(read, ondone)
    });

  function ondone(err, items) {
    if (err) throw err;
    assert.deepEqual(items, r2);
    assert.end();
  }
});

test("chain should turn map into composite sink", function (assert) {
  var sink = chain
    .map(JSON.stringify)
    .sink(function (read) {
      consume(read, ondone)
    });
  sink(counter(6));

  function ondone(err, items) {
    if (err) throw err;
    assert.deepEqual(items, r1);
    assert.end();
  }
});

test("chain should turn push into composite sink", function (assert) {
  var sink = chain
    .push(oddity)
    .sink(function (read) {
      consume(read, ondone)
    });
  sink(counter(6));

  function ondone(err, items) {
    if (err) throw err;
    assert.deepEqual(items, r2);
    assert.end();
  }
});

test("chain should turn map into composite source", function (assert) {
  var source = chain
    .source(counter(6))
    .map(JSON.stringify);

  consume(source, function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, r1);
    assert.end();
  });
});

test("chain should turn push into composite source", function (assert) {
  var source = chain
    .source(counter(6))
    .push(oddity);

  consume(source, function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, r2);
    assert.end();
  });
});

test("chain should turn push and map into composite pull filter", function (assert) {
  var pull = chain
    .push(oddity)
    .map(JSON.stringify);

  consume(pull(counter(6)), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, ['1','-1','3','-3','5','-5']);
    assert.end();
  });
});

test("chain should turn map and push into composite pull filter", function (assert) {
  var pull = chain
    .map(twice)
    .push(oddity);

  consume(pull(counter(6)), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, [-1,1,1,-1,3,-3,5,-5,7,-7,9,-9]);
    assert.end();
  });
});

// A sample push filter that doesn't always output 1-1 with it's input.
function oddity(emit) {
  return function (err, item) {
    if (item === undefined) return emit(err);
    if (item % 2 === 0) return;
    emit(null, item);
    emit(null, -item);
  };
}

function twice(num) {
  return 2 * num - 1;
}

// A source generator, counts from 0 to n - 1
function counter(n) {
  var i = 0;
  return function (close, callback) {
    if (close) callbacl(close === true ? null : close);
    else if (i < n) callback(null, i++);
    else callback();
  };
}
