"use strict";

const _ = require("lodash");
const assert = require("assert");
const sinon = require("sinon");
const EntitySet = require("../../../../../lib/model/oasis/dataSource/EntitySet");
const sampleSetMD = {
  $: {
    Name: "name",
    EntityType: "entityType1",
  },
  NavigationPropertyBinding: [
    {
      $: {
        Path: "p",
        Target: "t",
      },
    },
  ],
};

const entityType = {};
const sampleSchema = {
  resolveModelPath: sinon.stub().returns(entityType),
};

describe("EntitySet (oasis)", function () {
  describe("#constructor()", function () {
    it("initializes basic properties", function () {
      let set = new EntitySet(sampleSetMD, sampleSchema);
      assert.equal(set.raw, sampleSetMD);
      assert.equal(set.name, "name");
      assert.equal(set.entityType, entityType);
      assert.ok(set.includeInServiceDocument, entityType);
      assert.ok(_.isArray(set.navigationPropertyBindings));
      assert.equal(set.navigationPropertyBindings.length, 1);
    });
  });

  describe("#getParameterizationInfo()", function () {
    it("identifies prarametrized entity set", function () {
      let set = new EntitySet(sampleSetMD, sampleSchema);
      let navProp = {
        containsTarget: true,
        name: "Set",
        partner: "Parameters",
      };
      set.entityType.navigationProperties = [navProp];
      set.navigationPropertyBindings.push({
        path: "Set/Parameters",
        target: set.name,
      });

      let info = set.getParameterizationInfo();
      assert.ok(info.isParameterized);
      assert.strictEqual(info.valuesAssociation, navProp);
    });

    it("ignores incomplete prarametrization", function () {
      let set = new EntitySet(sampleSetMD, sampleSchema);
      let navProp = {
        containsTarget: true,
        name: "Set",
        partner: "Parameters",
      };
      set.entityType.navigationProperties = [navProp];

      let info = set.getParameterizationInfo();
      assert.ok(!info.isParameterized);
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements entity set api", function () {
      let api = new EntitySet(sampleSetMD, sampleSchema).getLegacyApiObject();
      assert.equal(api.Name, "name");
    });
  });
});
