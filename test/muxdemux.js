var mux = require('../mux');
var demux = require('../demux');
var arraySource = require('../array')
var consume = require('../consume');

var test = require('tape');

var s1 = [1,2,3,4,5,6,7,8,9,0];
var s2 = "a b c d e f g h i".split(" ");
var s3 = [true, false, null, true, false];

var names = ["numbers", "letters", "specials"];
var num = 3;

var mixed1 = [
  ["numbers", 1],
  ["numbers", 2],
  ["specials", true],
  ["numbers", 3],
  ["letters", "a"],
  ["numbers", 4],
  ["numbers", 5],
  ["letters", "b"],
  ["numbers", 6],
  ["specials", false],
  ["numbers", 7],
  ["letters", "c"],
  ["numbers", 8],
  ["letters", "d"],
  ["specials", null],
  ["letters", "e"],
  ["letters", "f"],
  ["letters", "g"],
  ["numbers", 9],
  ["numbers", 0],
  ["specials", true],
  ["letters", "h"],
  ["specials", false],
  ["letters", "i"],
];

var mixed2 = [
  [0, 1],
  [2, true],
  [2, false],
  [0, 2],
  [1, "a"],
  [0, 3],
  [1, "b"],
  [0, 4],
  [1, "c"],
  [1, "d"],
  [0, 5],
  [2, null],
  [0, 6],
  [1, "e"],
  [2, true],
  [1, "f"],
  [2, false],
  [1, "g"],
  [0, 7],
  [0, 8],
  [1, "h"],
  [0, 9],
  [0, 0],
  [1, "i"],
];

var mixed3 = [
  [0, 1],
  [1, 'a'],
  [2, true],
  [0, 2],
  [1, 'b'],
  [2, false],
  [0, 3],
  [1, 'c'],
  [2, null],
  [0, 4],
  [1, 'd'],
  [2, true],
  [0, 5],
  [1, 'e'],
  [2, false],
  [0, 6],
  [1, 'f'],
  [0, 7],
  [1, 'g'],
  [0, 8],
  [1, 'h'],
  [0, 9],
  [1, 'i'],
  [0, 0 ]
];

var mixed4 = [
  ["numbers", 1],
  ["letters", "a"],
  ["specials", true],
  ["numbers", 2],
  ["letters", "b"],
  ["specials", false],
  ["numbers", 3],
  ["letters", "c"],
  ["specials", null],
  ["numbers", 4],
  ["letters", "d"],
  ["specials", true],
  ["numbers", 5],
  ["letters", "e"],
  ["specials", false],
  ["numbers", 6],
  ["letters", "f"],
  ["numbers", 7],
  ["letters", "g"],
  ["numbers", 8],
  ["letters", "h"],
  ["numbers", 9],
  ["letters", "i"],
  ["numbers", 0]
];

test('demux works on sync object streams', function (assert) {
  var sources = demux(names, arraySource(mixed1));
  assert.ok(sources.numbers, "has numbers source");
  assert.ok(sources.letters, "has letters source");
  assert.ok(sources.specials, "has specials source");
  consume.all(sources, function (err, result) {
    if (err) throw err;
    assert.deepEqual(result.numbers, s1, "numbers extracted");
    assert.deepEqual(result.letters, s2, "letters extracted");
    assert.deepEqual(result.specials, s3, "specials extracted");
    assert.end();
  });
});

test('demux works on async object streams', function (assert) {
  var sources = demux(names, arraySource.async(mixed1));
  assert.ok(sources.numbers, "has numbers source");
  assert.ok(sources.letters, "has letters source");
  assert.ok(sources.specials, "has specials source");
  consume.all(sources, function (err, result) {
    if (err) throw err;
    assert.deepEqual(result.numbers, s1, "numbers extracted");
    assert.deepEqual(result.letters, s2, "letters extracted");
    assert.deepEqual(result.specials, s3, "specials extracted");
    assert.end();
  });
});

test('demux works on sync array streams', function (assert) {
  var sources = demux(num, arraySource(mixed2));
  assert.ok(Array.isArray(sources), "has array of sources");
  assert.equal(sources.length, 3, "has 3 sources");
  consume.all(sources, function (err, result) {
    if (err) throw err;
    assert.deepEqual(result[0], s1, "numbers extracted");
    assert.deepEqual(result[1], s2, "letters extracted");
    assert.deepEqual(result[2], s3, "specials extracted");
    assert.end();
  });
});

test('demux works on async array streams', function (assert) {
  var sources = demux(num, arraySource.async(mixed2));
  assert.ok(Array.isArray(sources), "has array of sources");
  assert.equal(sources.length, 3, "has 3 sources");
  consume.all(sources, function (err, result) {
    if (err) throw err;
    assert.deepEqual(result[0], s1, "numbers extracted");
    assert.deepEqual(result[1], s2, "letters extracted");
    assert.deepEqual(result[2], s3, "specials extracted");
    assert.end();
  });
});

test('demux can ignore some streams', function (assert) {
  var sources = demux(["letters"], arraySource(mixed4));
  assert.ok(!("numbers" in sources), "not have numbers source");
  assert.ok(sources.letters, "has letters source");
  assert.ok(!("specials" in sources), "not have specials source");
  consume.all(sources, function (err, result) {
    if (err) throw err;
    assert.deepEqual(result.letters, s2, "letters extracted");
    assert.end();
  });
});

test('demux can ignore all streams', function (assert) {
  var sources = demux(0, arraySource(mixed3));
  assert.ok(Array.isArray(sources), "sources is array");
  assert.equal(sources.length, 0, "no sources returned");
  assert.end();
});

test('mux works on array of sync streams', function (assert) {
  consume(mux([
    arraySource(s1),
    arraySource(s2),
    arraySource(s3)
  ]), function (err, items) {
    if (err) throw err;
    assert.equal(items.length, s1.length + s2.length + s3.length, "all items are accounted for");
    assert.deepEqual(items, mixed3, "streams are mixed together");
    assert.end();
  });
});

test('mux works on array of async streams', function (assert) {
  consume(mux([
    arraySource.async(s1),
    arraySource.async(s2),
    arraySource.async(s3)
  ]), function (err, items) {
    if (err) throw err;
    assert.equal(items.length, s1.length + s2.length + s3.length, "all items are accounted for");
    // We can't check order since the async streams are indeterminate.  But we can use demux to check.
    consume.all(demux(num, arraySource(items)), function (err, result) {
      if (err) throw err;
      assert.deepEqual(result[0], s1, "numbers extracted");
      assert.deepEqual(result[1], s2, "letters extracted");
      assert.deepEqual(result[2], s3, "specials extracted");
      assert.end();
    });
  });
});


test('mux works on hash of sync streams', function (assert) {
  consume(mux({
    numbers: arraySource(s1),
    letters: arraySource(s2),
    specials: arraySource(s3)
  }), function (err, items) {
    if (err) throw err;
    assert.equal(items.length, s1.length + s2.length + s3.length, "all items are accounted for");
    assert.deepEqual(items, mixed4, "streams are mixed together");
    assert.end();
  });
});

test('mux works on hash of async streams', function (assert) {
  consume(mux({
    numbers: arraySource.async(s1),
    letters: arraySource.async(s2),
    specials: arraySource.async(s3)
  }), function (err, items) {
    if (err) throw err;
    assert.equal(items.length, s1.length + s2.length + s3.length, "all items are accounted for");
    // We can't check order since the async streams are indeterminate.  But we can use demux to check.
    consume.all(demux(names, arraySource(items)), function (err, result) {
      if (err) throw err;
      assert.deepEqual(result.numbers, s1, "numbers extracted");
      assert.deepEqual(result.letters, s2, "letters extracted");
      assert.deepEqual(result.specials, s3, "specials extracted");
      assert.end();
    });
  });
});

