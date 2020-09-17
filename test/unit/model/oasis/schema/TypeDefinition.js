"use strict";

const assert = require("assert");
const TypeDefinition = require("../../../../../lib/model/oasis/schema/TypeDefinition");
const sampleMD = {
  $: {
    MaxLength: "50",
    Name: "typeDefinition",
    Precision: "7",
    Scale: "4",
    UnderlyingType: "type",
    Unicode: "false",
  },
};

const smallsampleMD = {
  $: {
    Name: "typeDefinition",
    UnderlyingType: "type",
  },
};

let sampleType = {
  namespaceQualifiedName: "type",
};

const sampleSchema = {
  getType: () => sampleType,
};

describe("TypeDefinition", function () {
  describe("#constructor()", function () {
    it("parses properties from metadata", function () {
      let td = new TypeDefinition(sampleMD);
      assert.equal(td.raw, sampleMD);
      assert.equal(td.maxLength, 50);
      assert.equal(td.precision, 7);
      assert.equal(td.scale, 4);
      assert.equal(td.unicode, false);
    });

    it("defaults missing properties", function () {
      let td = new TypeDefinition(smallsampleMD);
      assert.equal(td.maxLength, undefined);
      assert.equal(td.unicode, true);
    });

    it("throws error if name or underlying type is missing", function () {
      assert.throws(
        () =>
          new TypeDefinition({
            $: {
              UnderlyingType: "Type",
            },
          })
      );

      assert.throws(
        () =>
          new TypeDefinition({
            $: {
              Name: "name",
            },
          })
      );
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("resolves type reference", function () {
      let rt = new TypeDefinition(sampleMD);
      rt.initSchemaDependentProperties(sampleSchema);
      assert.equal(rt.underlyingType, sampleType);
    });
  });
});
