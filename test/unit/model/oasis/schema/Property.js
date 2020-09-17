"use strict";

const _ = require("lodash");
const assert = require("assert");
const Property = require("../../../../../lib/model/oasis/schema/Property");
const samplePropertyMD = {
  $: {
    DefaultValue: "default",
    MaxLength: "50",
    Name: "property",
    Nullable: "false",
    Precision: "7",
    Scale: "4",
    Type: "type",
    Unicode: "false",
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

describe("Property (oasis)", function () {
  describe("#constructor()", function () {
    it("parses properties from metadata", function () {
      let prop = new Property(samplePropertyMD);
      assert.equal(prop.raw, samplePropertyMD);
      assert.equal(prop.name, "property");
      assert.equal(prop.maxLength, 50);
      assert.equal(prop.nullable, false);
      assert.equal(prop.precision, 7);
      assert.equal(prop.scale, 4);
      assert.equal(prop.unicode, false);
    });

    it("defaults missing properties", function () {
      let prop = new Property(smallsamplePropertyMD);
      assert.equal(prop.nullable, true);
      assert.equal(prop.maxLength, undefined);
      assert.equal(prop.unicode, true);
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("resolves type reference and default value", function () {
      let prop = new Property(samplePropertyMD);
      prop.initSchemaDependentProperties(sampleSchema);
      assert.equal(prop.type, sampleEntityType);
      assert.equal(prop.defaultValue, "default");
    });

    it("no implicit default value", function () {
      let prop = new Property(smallsamplePropertyMD);
      prop.initSchemaDependentProperties(sampleSchema);
      assert.equal(prop.type, sampleEntityType);
      assert.equal(prop.defaultValue, undefined);
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
