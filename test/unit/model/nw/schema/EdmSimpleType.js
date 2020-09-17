"use strict";

const assert = require("assert");
const EdmSimpleType = require("../../../../../lib/model/nw/schema/EdmSimpleType");

function getType(name) {
  return EdmSimpleType.instances.find((t) => t.name === name);
}

describe("EdmSimpleType (nw)", function () {
  it("initializes properties", function () {
    [
      "Binary",
      "Boolean",
      "Byte",
      "DateTime",
      "DateTimeOffset",
      "Decimal",
      "Double",
      "Float",
      "Guid",
      "Int16",
      "Int32",
      "Int64",
      "SByte",
      "Single",
      "String",
      "Time",
    ].forEach((name) => {
      let type = getType(name);
      assert.ok(type);
      assert.strictEqual(type.namespaceQualifiedName, "Edm." + name);
    });
  });

  it("handles Boolean", function () {
    let type = getType("Boolean");
    assert.strictEqual(type.format(""), "false");
    assert.strictEqual(type.format(0), "false");
    assert.strictEqual(type.format(false), "false");
    assert.strictEqual(type.format("0"), "true");
    assert.strictEqual(type.format(true), "true");
    assert.strictEqual(type.format(10), "true");
    assert.strictEqual(type.format(null), "null");
    assert.strictEqual(type.format(undefined), "null");

    assert.strictEqual(type.formatBody(""), false);
    assert.strictEqual(type.formatBody(0), false);
    assert.strictEqual(type.formatBody(false), false);
    assert.strictEqual(type.formatBody("0"), true);
    assert.strictEqual(type.formatBody(true), true);
    assert.strictEqual(type.formatBody(10), true);
    assert.strictEqual(type.formatBody(null), null);
    assert.strictEqual(type.formatBody(undefined), null);
  });

  it("handles Byte", function () {
    let type = getType("Byte");
    assert.throws(() => type.format("X"));
    assert.throws(() => type.format(-1));
    assert.throws(() => type.format(256));
    assert.strictEqual(type.format(0), 0);
    assert.strictEqual(type.format(255), 255);
    assert.strictEqual(type.format("0"), 0);
    assert.strictEqual(type.format("255"), 255);
    assert.strictEqual(type.formatBody(0), 0);
    assert.strictEqual(type.formatBody(255), 255);
  });

  it("handles DateTime", function () {
    let type = getType("DateTime");
    assert.throws(() => type.format("A"));
    assert.strictEqual(
      type.format("datetime'2000-12-12T12:00'"),
      "datetime'2000-12-12T12:00:00'"
    );
    assert.strictEqual(
      type.format("/Date(1514764800000)/"),
      "datetime'2018-01-01T00:00:00'"
    );
    assert.strictEqual(
      type.format(new Date(1514764800000)),
      "datetime'2018-01-01T00:00:00'"
    );

    assert.strictEqual(
      type.formatBody("datetime'2000-12-12T12:00'"),
      "/Date(976622400000)/"
    );
    assert.strictEqual(
      type.formatBody("/Date(1514764800000)/"),
      "/Date(1514764800000)/"
    );
    assert.strictEqual(
      type.formatBody(new Date(1514764800000)),
      "/Date(1514764800000)/"
    );
  });

  it("handles Guid", function () {
    let type = getType("Guid");
    assert.strictEqual(
      type.format("2139e846-8e4a-40cb-b59b-7c2b81088e03"),
      "guid'2139e846-8e4a-40cb-b59b-7c2b81088e03'"
    );
    assert.strictEqual(
      type.format("guid'2139e846-8e4a-40cb-b59b-7c2b81088e03'"),
      "guid'2139e846-8e4a-40cb-b59b-7c2b81088e03'"
    );
    assert.throws(() => {
      type.format("2139e846-8e4a-40cb-b59b-7c2b81088e03#");
    }, "Invalid Guid last character is invalid");
    assert.strictEqual(type.format(null), "null");
    assert.strictEqual(type.format(undefined), "null");

    assert.strictEqual(
      type.formatBody("2139e846-8e4a-40cb-b59b-7c2b81088e03"),
      "2139e846-8e4a-40cb-b59b-7c2b81088e03"
    );
  });

  it("handles String", function () {
    let type = getType("String");
    assert.strictEqual(type.format(true), "'true'");
    assert.strictEqual(type.format(1), "'1'");
    assert.strictEqual(type.format("TEST"), "'TEST'");
    assert.strictEqual(type.format("#"), "'%23'");
    assert.strictEqual(type.format(null), "null");
    assert.strictEqual(type.format(undefined), "null");

    assert.strictEqual(type.formatBody(true), "true");
    assert.strictEqual(type.formatBody(1), "1");
    assert.strictEqual(type.formatBody("TEST"), "TEST");
    assert.strictEqual(type.formatBody("#"), "#");
  });
});
