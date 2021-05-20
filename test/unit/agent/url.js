"use strict";

const assert = require("assert");
const url = require("../../../lib/agent/url");

describe("url", function () {
  it(".password()", function () {
    assert.equal(url.password("https://jmeno:heslo@example.com/"), "heslo");
    assert.equal(url.password("https://:heslo@example.com/"), "heslo");
    assert.equal(url.password("https://jmeno@example.com/"), "");
    assert.equal(url.password("https://example.com/"), "");
    assert.throws(function () {
      url.password("blbost/");
    });
    assert.throws(function () {
      url.password();
    });
  });
  it(".username()", function () {
    assert.equal(url.username("https://jmeno:heslo@example.com/"), "jmeno");
    assert.equal(url.username("https://jmeno@example.com/"), "jmeno");
    assert.equal(url.username("https://example.com/"), "");
    assert.throws(function () {
      url.username("blbost/");
    });
    assert.throws(function () {
      url.username();
    });
  });
  it(".base()", function () {
    assert.equal(
      url.base("https://jmeno:heslo@example.com/"),
      "https://example.com/"
    );
    assert.equal(
      url.base("https://jmeno:heslo@example.com/path/to/service"),
      "https://example.com/path/to/service"
    );
    assert.equal(
      url.base("https://jmeno@example.com/"),
      "https://example.com/"
    );
    assert.equal(
      url.base("https://jmeno@example.com/path/to/service"),
      "https://example.com/path/to/service"
    );
    assert.equal(url.base("https://example.com/"), "https://example.com/");
    assert.equal(url.base("http://example.com/"), "http://example.com/");
    assert.equal(
      url.base("https://example.com/path/to/service"),
      "https://example.com/path/to/service"
    );
    assert.equal(
      url.base("http://example.com/path/to/service/"),
      "http://example.com/path/to/service/"
    );
    assert.throws(function () {
      url.username("blbost/");
    });
    assert.throws(function () {
      url.username();
    });
  });
  it(".normalize()", function () {
    assert.equal(
      url.normalize("/EntitySet/", "https://example.com/"),
      "https://example.com/EntitySet/"
    );
    assert.equal(
      url.normalize("/EntitySet", "https://example.com/"),
      "https://example.com/EntitySet"
    );
    assert.equal(
      url.normalize("/EntitySet?$count=1", "https://example.com/"),
      "https://example.com/EntitySet?$count=1"
    );
    assert.equal(
      url.normalize("/EntitySet?$count=1", "https://example.com/path/"),
      "https://example.com/path/EntitySet?$count=1"
    );
    assert.throws(function () {
      url.normalize();
    });
  });
  it(".appendSearch()", function () {
    assert.equal(
      url.appendSearch("https://localhost/", "foo=2"),
      "https://localhost/?foo=2"
    );
    assert.equal(
      url.appendSearch("https://localhost/?bar=1", "foo=2"),
      "https://localhost/?bar=1&foo=2"
    );
    assert.throws(() => {
      url.appendSearch("https://localhost/?bar=1");
    });
    assert.throws(() => {
      url.appendSearch();
    });
  });

  it(".absolutizePath()", function () {
    assert.strictEqual(
      url.absolutizePath("foo"),
      "/foo",
      "Add slash to the begining"
    );
    assert.strictEqual(
      url.absolutizePath("/foo/bar"),
      "/foo/bar",
      "Do not change absolutized path"
    );
    assert.strictEqual(
      url.absolutizePath("//foo/bar"),
      "/foo/bar",
      "Remove duplicated slash"
    );
    [null, 1, undefined, NaN, {}].forEach((testVar) => {
      assert.strictEqual(
        url.absolutizePath(testVar),
        testVar,
        `Do not touch character "${JSON.stringify(testVar)}"`
      );
    });
  });
});
