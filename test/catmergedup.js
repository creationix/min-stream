var test = require('tape');

var arraySource = require('../array')
var consume = require('../consume');

var dup = require('../dup.js');
var merge = require('../merge.js');
var cat = require('../cat.js');

var s1 = [1,2,3,4,5];
var s2 = [6,7,8,9,0];
var s3 = [1,2,3,4,5,6,7,8,9,0];
var s4 = [1,6,2,7,3,8,4,9,5,0];
var s5 = [1,1,1,2,2,2,3,3,3,4,4,4,5,5,5];
test('cat works with array and sync stream', function (assert) {
  consume(cat(s1, arraySource(s2)), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s3);
    assert.end();
  });
});

test('cat works with sync stream and array', function (assert) {
  consume(cat(arraySource(s1), s2), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s3);
    assert.end();
  });
});


test('cat works two sync streams', function (assert) {
  consume(cat(arraySource(s1), arraySource(s2)), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s3);
    assert.end();
  });
});

test('cat works with two arrays', function (assert) {
  consume(cat(s1, s2), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s3);
    assert.end();
  });
});

test('cat works with one array', function (assert) {
  consume(cat(s1), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s1);
    assert.end();
  });
});

test('cat works with one sync stream', function (assert) {
  consume(cat(arraySource(s1)), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s1);
    assert.end();
  });
});

test('cat works with no inputs', function (assert) {
  consume(cat(), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, []);
    assert.end();
  });
});


test('cat works with array and async stream', function (assert) {
  consume(cat(s1, arraySource.async(s2)), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s3);
    assert.end();
  });
});

test('cat works with async stream and array', function (assert) {
  consume(cat(arraySource.async(s1), s2), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s3);
    assert.end();
  });
});


test('merge works with two sync streams', function (assert) {
  consume(merge(arraySource(s1), arraySource(s2)), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s4);
    assert.end();
  });
});

test('merge works with two async streams', function (assert) {
  consume(merge(arraySource.async(s1), arraySource.async(s2)), function (err, items) {
    if (err) throw err;
    assert.equal(items.length, 10, "Result has 10 items");
    items.sort();
    items.push(items.shift());
    assert.deepEqual(items, s3);
    assert.end();
  });
})

test('dup works with sync stream', function (assert) {
  var streams = dup(3, arraySource(s1));
  assert.equal(streams.length, 3, "there are 3 output streams");
  consume(merge.apply(null, streams), function (err, items) {
    if (err) throw err;
    assert.deepEqual(items, s5);
    assert.end();
  });
});
