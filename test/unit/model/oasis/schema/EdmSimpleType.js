"use strict";

const assert = require("assert").strict;
const EdmSimpleType = require("../../../../../lib/model/oasis/schema/EdmSimpleType");

function getType(name) {
  return EdmSimpleType.instances.find((t) => t.name === name);
}

describe("EdmSimpleType (oasis)", function () {
  it("initializes properties", function () {
    [
      "Binary",
      "Boolean",
      "Byte",
      "Date",
      "DateTimeOffset",
      "Decimal",
      "Double",
      "Duration",
      "Guid",
      "Int16",
      "Int32",
      "Int64",
      "SByte",
      "Single",
      "String",
      "TimeOfDay",
    ].forEach((name) => {
      let type = getType(name);
      assert.ok(type, name, type);
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

  it("handles DateTimeOffset", function () {
    let type = getType("DateTimeOffset");
    assert.throws(() => type.format("A"));
    assert.strictEqual(
      type.format("2020-04-21T18:05:26.833682Z"),
      "2020-04-21T18:05:26.833Z"
    );
    assert.strictEqual(
      type.format(new Date("2020-04-21T18:05:26.833682Z")),
      "2020-04-21T18:05:26.833Z"
    );

    assert.strictEqual(
      type.formatBody("2020-04-21T18:05:26.833682Z"),
      "2020-04-21T18:05:26.833Z"
    );
    assert.strictEqual(
      type.formatBody(new Date("2020-04-21T18:05:26.833682Z")),
      "2020-04-21T18:05:26.833Z"
    );
  });

  it("handles Guid", function () {
    let type = getType("Guid");
    assert.strictEqual(
      type.format("2139e846-8e4a-40cb-b59b-7c2b81088e03"),
      "2139e846-8e4a-40cb-b59b-7c2b81088e03"
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

  it("handles Decimal", function () {
    let type = getType("Decimal");
    assert.equal(type.format(true), 1);
    assert.equal(type.format(10.25), 10.25);
    assert.equal(type.format("10.25"), 10.25);
    assert.ok(isNaN(type.format({})));
    assert.ok(isNaN(type.format("foo")));
  });
});
