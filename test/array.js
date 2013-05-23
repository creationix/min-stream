var array = require('../array.js');
var test = require('tape');

test("array should create a proper source stream", function (assert) {
  var source = array([1,2,3]);
  source(null, function (err, item) {
    if (err) throw err;
    assert.equal(item, 1);
    source(null, function (err, item) {
      if (err) throw err;
      assert.equal(item, 2);
      source(null, function (err, item) {
        if (err) throw err;
        assert.equal(item, 3);
        source(null, function (err, item) {
          if (err) throw err;
          assert.equal(item, undefined);
          assert.end();
        });
      });
    });
  });
});

test("array should create a proper async source stream", function (assert) {
  var source = array.async([1,2,3]);
  source(null, function (err, item) {
    if (err) throw err;
    assert.equal(item, 1);
    source(null, function (err, item) {
      if (err) throw err;
      assert.equal(item, 2);
      source(null, function (err, item) {
        if (err) throw err;
        assert.equal(item, 3);
        source(null, function (err, item) {
          if (err) throw err;
          assert.equal(item, undefined);
          assert.end();
        });
      });
    });
  });
});

test("array should respond to close", function (assert) {
  var source = array.async([1,2,3]);
  source(null, function (err, item) {
    if (err) throw err;
    assert.equal(item, 1);
    source(true, function (err) {
      if (err) throw err;
      assert.end();
    });
  });
});
