"use strict";

const _ = require("lodash");
const assert = require("assert");
const Property = require("../../../../../lib/model/nw/schema/Property");
const samplePropertyMD = {
  $: {
    Name: "property",
    Type: "type",
    Nullable: "false",
    MaxLength: "50",
  },
};

const smallsamplePropertyMD = {
  $: {
    Name: "property",
    Type: "type",
  },
};

let sampleEntityType = {
  namespaceQualifiedName: "type",
};
const sampleSchema = {
  getType: () => sampleEntityType,
};

describe("Property (nw)", function () {
  describe("#constructor()", function () {
    it("parses properties from metadata", function () {
      let prop = new Property(samplePropertyMD);
      assert.equal(prop.raw, samplePropertyMD);
      assert.equal(prop.name, "property");
      assert.equal(prop.nullable, false);
      assert.equal(prop.maxLength, 50);
    });

    it("defaults missing properties", function () {
      let prop = new Property(smallsamplePropertyMD);
      assert.equal(prop.nullable, true);
      assert.equal(prop.maxLength, undefined);
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("resolves type reference", function () {
      let prop = new Property(samplePropertyMD);
      prop.initSchemaDependentProperties(sampleSchema);
      assert.equal(prop.type, sampleEntityType);
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements annotations api", function () {
      let prop = new Property(samplePropertyMD);
      prop.initSchemaDependentProperties(sampleSchema);
      let api = prop.getLegacyApiObject();

      assert.equal(api.Name, "property");
      assert.ok(_.has(api, "Annotations"));
      assert.equal(api.Type, "type");
      assert.equal(api.Nullable, false);
      assert.equal(api.MaxLength, 50);
    });
  });
});
