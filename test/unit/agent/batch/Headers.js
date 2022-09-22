"use strict";

const assert = require("assert").strict;
const _ = require("lodash");
const Headers = require("../../../../lib/agent/batch/Headers");

describe("agent/batch/Headers", function () {
  let headers;

  beforeEach(function () {
    headers = new Headers([]);
  });

  it(".constructor", function () {
    assert.deepEqual(headers.headerKeys, []);
  });

  describe(".parseHeadersArray", function () {
    it("valid headers passed", function () {
      headers.parseHeadersArray([
        "header1",
        "HEADER_1_VALUE",
        "header2",
        "HEADER_2_VALUE",
      ]);
      assert.equal(headers.header1, "HEADER_1_VALUE");
      assert.equal(headers.header2, "HEADER_2_VALUE");
      assert.deepEqual(headers.headerKeys, ["header1", "header2"]);
    });
    it("odd raw headers array", function () {
      headers.parseHeadersArray(["header1", "HEADER_1_VALUE", "header2"]);
      assert.equal(headers.header1, "HEADER_1_VALUE");
      assert.ok(!_.has(headers, "header2"));
      assert.deepEqual(headers.headerKeys, ["header1"]);
    });
  });

  it("odd raw headers array", function () {
    headers.headerKeys = ["Content-Type"];
    headers["Content-Type"] = "CONTENT_TYPE";
    assert.equal(headers.get("Content-Type"), "CONTENT_TYPE");
    assert.equal(headers.get("content-type"), "CONTENT_TYPE");
    assert.equal(headers.get("content-Type"), "CONTENT_TYPE");
    assert.equal(headers.get("missing-header"), undefined);
  });
});
