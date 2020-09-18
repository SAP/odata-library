"use strict";

const assert = require("assert");
const sinon = require("sinon");
const EntitySet = require("../../../../../lib/model/nw/dataSource/EntitySet");
const sampleSetMD = {
  $: {
    Name: "name",
    EntityType: "entityType1",
  },
};

function getSchema(entityType) {
  return {
    resolveModelPath: sinon.stub().returns(entityType),
  };
}

describe("EntitySet (nw)", function () {
  describe("#constructor()", function () {
    it("initializes basic properties", function () {
      let sampleEntityType = {};
      let set = new EntitySet(sampleSetMD, getSchema(sampleEntityType));
      assert.equal(set.raw, sampleSetMD);
      assert.equal(set.name, "name");
      assert.equal(set.entityType, sampleEntityType);
    });
  });

  describe("#getParameterizationInfo()", function () {
    it("identifies analytical prarametrized entity set", function () {
      let et = {
        sap: {
          semantics: "parameters",
        },
      };

      let set = new EntitySet(sampleSetMD, getSchema(et));
      let navProp = {};
      set.entityType.navigationProperties = [navProp];
      let schema = getSchema({
        ends: [
          {
            type: {
              sap: {
                semantics: "aggregate",
              },
            },
          },
        ],
      });

      let info = set.getParameterizationInfo(schema);
      assert.ok(info.isParameterized);
      assert.strictEqual(info.valuesAssociation, navProp);
    });

    it("identifies transactional prarametrized entity set", function () {
      let et = {
        name: "SomeNameParameters",
        sap: {
          semantics: "parameters",
        },
      };

      let set = new EntitySet(sampleSetMD, getSchema(et));
      let navProp = {
        name: "Set",
      };
      set.entityType.navigationProperties = [navProp];
      let schema = getSchema({
        ends: [
          {
            type: {
              name: "SomeNameType",
              sap: {},
            },
          },
        ],
      });

      let info = set.getParameterizationInfo(schema);
      assert.ok(info.isParameterized);
      assert.strictEqual(info.valuesAssociation, navProp);
    });

    it("ignores incomplete prarametrization", function () {
      let et = {
        sap: {
          semantics: "parameters",
        },
      };

      let set = new EntitySet(sampleSetMD, getSchema(et));
      set.entityType.navigationProperties = [];
      let schema = getSchema({});

      let info = set.getParameterizationInfo(schema);
      assert.ok(!info.isParameterized);
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements entity set api", function () {
      let api = new EntitySet(sampleSetMD, getSchema({})).getLegacyApiObject();
      assert.equal(api.Name, "name");
    });
  });
});
