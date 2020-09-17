"use strict";

const _ = require("lodash");
const assert = require("assert");
const ComplexType = require("../../../../../lib/model/oasis/schema/ComplexType");
const sampleComplexTypeMD = {
  $: {
    Name: "ComplexType1",
  },
  NavigationProperty: [
    {
      $: {
        Name: "NavProp1",
        Type: "Edm.EntityType",
      },
    },
  ],
  Property: [
    {
      $: {
        Name: "Prop1",
        Type: "Edm.String",
      },
    },
  ],
};

const schema = {
  namespace: "ns",
  getType: (name) => ({
    namespaceQualifiedName: name,
  }),
};

describe("ComplexType (oasis)", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      assert.equal(type.raw, sampleComplexTypeMD);
      assert.equal(type.name, "ComplexType1");
      assert.ok(_.isArray(type.properties));
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("initializes namespaceQualifiedName and properties", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      type.initSchemaDependentProperties(schema);
      assert.equal(type.namespaceQualifiedName, "ns.ComplexType1");
      assert.equal(
        type.properties[0].type.namespaceQualifiedName,
        "Edm.String"
      );
    });
  });

  describe(".getProperty()", function () {
    it("gets property by its name", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      let prop = type.getProperty("Prop1");
      assert.ok(prop);
      assert.equal(prop.name, "Prop1");
    });

    it("throw error when property is not available", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      assert.throws(() => type.getProperty("noProp"));
    });
  });

  describe(".getNavigationProperty()", function () {
    it("gets navigation property by its name", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      let prop = type.getNavigationProperty("NavProp1");
      assert.ok(prop);
      assert.equal(prop.name, "NavProp1");
    });

    it("throw error when navigation property is not available", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      assert.throws(() => type.getNavigationProperty("noProp"));
    });
  });

  describe(".resolveModelPath()", function () {
    it("resolves itself", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      assert.deepEqual(type.resolveModelPath(), type);
    });

    it("resolves properties", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      assert.equal(type.resolveModelPath("Prop1").name, "Prop1");
    });

    it("resolves navigation properties", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      assert.equal(type.resolveModelPath("NavProp1").name, "NavProp1");
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements annotations api", function () {
      let type = new ComplexType(sampleComplexTypeMD);
      type.initSchemaDependentProperties(schema);
      let api = type.getLegacyApiObject();
      assert.equal(api.Name, "ComplexType1");
      assert.ok(_.has(api, "Annotations"));
      assert.ok(_.has(api, "Properties"));
      assert.ok(api.Properties.Prop1);
    });
  });
});
