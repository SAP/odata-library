"use strict";

const _ = require("lodash");
const assert = require("assert");
const sinon = require("sinon");
const ComplexType = require("../../../../../lib/model/nw/schema/ComplexType");
const sampleComplexTypeMD = {
  $: {
    Name: "ComplexType1",
  },
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

describe("ComplexType (nw)", function () {
  let model;
  let type;
  beforeEach(function () {
    model = {};
    type = new ComplexType(sampleComplexTypeMD, model);
  });

  describe("#constructor()", function () {
    it("initializes properties", function () {
      assert.equal(type.raw, sampleComplexTypeMD);
      assert.equal(type.name, "ComplexType1");
      assert.ok(_.isArray(type.properties));
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("initializes namespaceQualifiedName and properties", function () {
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
      let prop = type.getProperty("Prop1");
      assert.ok(prop);
      assert.equal(prop.name, "Prop1");
    });

    it("throw error when property is not available", function () {
      assert.throws(() => type.getProperty("noProp"));
    });

    it("no throw error when property is not available in no strict", function () {
      let prop = type.getProperty("noProp", false);
      assert.ok(!prop);
    });

    it("get property from navigation property of the entityType", function () {
      model.resolveModelPath = sinon.stub().returns({
        ends: [
          "FROM",
          {
            type: {
              properties: [
                {
                  name: "propertyInNP",
                },
              ],
            },
          },
        ],
      });
      type.navigationProperties = [
        {
          name: "toNavigationProperty",
          relationship: "RELATIONSHIP",
        },
      ];
      assert.deepEqual(type.getProperty("toNavigationProperty/propertyInNP"), {
        name: "propertyInNP",
      });
      assert.ok(model.resolveModelPath.calledWithExactly("RELATIONSHIP"));
    });

    it("missing property in the entityType navigation property", function () {
      model.resolveModelPath = sinon.stub().returns({
        ends: [
          "FROM",
          {
            type: {
              properties: [
                {
                  name: "propertyInNP",
                },
              ],
            },
          },
        ],
      });
      type.navigationProperties = [
        {
          name: "toNavigationProperty",
          relationship: "RELATIONSHIP",
        },
      ];
      assert.throws(() => {
        type.getProperty("toNavigationProperty/missingPropertyInNP");
      });
      let missing = type.getProperty(
        "toNavigationProperty/missingPropertyInNP",
        false
      );
      assert.ok(!missing);
      assert.ok(model.resolveModelPath.calledWithExactly("RELATIONSHIP"));
    });
  });

  describe(".resolveModelPath()", function () {
    it("resolves itself", function () {
      type = new ComplexType(sampleComplexTypeMD);
      assert.deepEqual(type.resolveModelPath(), type);
    });

    it("resolves properties", function () {
      type = new ComplexType(sampleComplexTypeMD);
      assert.equal(type.resolveModelPath("Prop1").name, "Prop1");
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements annotations api", function () {
      type = new ComplexType(sampleComplexTypeMD);
      type.initSchemaDependentProperties(schema);
      let api = type.getLegacyApiObject();
      assert.equal(api.Name, "ComplexType1");
      assert.ok(_.has(api, "Annotations"));
      assert.ok(_.has(api, "Properties"));
      assert.ok(api.Properties.Prop1);
    });
  });
});
