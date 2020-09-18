"use strict";

const assert = require("assert");
const ReturnType = require("../../../../../lib/model/oasis/schema/ReturnType");
const sampleMD = {
  $: {
    MaxLength: "50",
    Nullable: "false",
    Precision: "7",
    Scale: "4",
    Type: "type",
    Unicode: "false",
  },
};

const smallsampleMD = {
  $: {
    Type: "type",
  },
};

let sampleType = {
  namespaceQualifiedName: "type",
};

const sampleSchema = {
  getType: () => sampleType,
};

describe("ReturnType", function () {
  describe("#constructor()", function () {
    it("parses properties from metadata", function () {
      let rt = new ReturnType(sampleMD);
      assert.equal(rt.raw, sampleMD);
      assert.equal(rt.maxLength, 50);
      assert.equal(rt.nullable, false);
      assert.equal(rt.precision, 7);
      assert.equal(rt.scale, 4);
      assert.equal(rt.unicode, false);
    });

    it("defaults missing properties", function () {
      let rt = new ReturnType(smallsampleMD);
      assert.equal(rt.nullable, true);
      assert.equal(rt.maxLength, undefined);
      assert.equal(rt.unicode, true);
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("resolves type reference", function () {
      let rt = new ReturnType(sampleMD);
      rt.initSchemaDependentProperties(sampleSchema);
      assert.equal(rt.type, sampleType);
    });
  });
});
