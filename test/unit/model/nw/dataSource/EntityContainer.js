"use strict";

const _ = require("lodash");
const assert = require("assert");
const sinon = require("sinon");
const EntityContainer = require("../../../../../lib/model/nw/dataSource/EntityContainer");
const sampleContainerMD = {
  $: {
    Name: "EntityContainer",
  },
  FunctionImport: [
    {
      $: {
        Name: "FunctionImport1",
      },
    },
  ],
  EntitySet: [
    {
      $: {
        Name: "EntitySet1",
      },
    },
    {
      $: {
        Name: "EntitySet2",
      },
    },
  ],
};

const sampleSchema = {
  resolveModelPath: sinon.stub(),
  getType: sinon.stub(),
};

describe("EntityContainer (nw)", function () {
  describe("#constructor()", function () {
    it("initializes basic properties", function () {
      let container = new EntityContainer(sampleContainerMD);
      assert.equal(container.raw, sampleContainerMD);
      assert.equal(container.name, "EntityContainer");
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("resolves itself", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.ok(_.isArray(container.entitySets));
    });
  });

  describe(".getEntitySet()", function () {
    it("finds entity set", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.ok(container.getEntitySet("EntitySet1"));
    });

    it("throw error when set is not available", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.throws(() => container.getEntitySet("NotEntitySet"));
    });
  });

  describe(".getFunctionImport()", function () {
    it("finds function import", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.ok(container.getFunctionImport("FunctionImport1"));
    });

    it("throw error when import is not available", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.throws(() => container.getFunctionImport("NotFunctionImport"));
    });
  });

  describe(".resolveModelPath()", function () {
    it("resolves itself", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.deepEqual(container.resolveModelPath(), container);
    });

    it("resolves entity sets", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.equal(container.resolveModelPath("EntitySet1").name, "EntitySet1");
    });
  });
});
