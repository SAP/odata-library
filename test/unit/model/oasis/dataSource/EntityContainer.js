"use strict";

const _ = require("lodash");
const assert = require("assert");
const sinon = require("sinon");
const EntityContainer = require("../../../../../lib/model/oasis/dataSource/EntityContainer");
const sampleContainerMD = {
  $: {
    Name: "EntityContainer",
  },
  ActionImport: [
    {
      $: {
        Name: "ActionImport1",
        Action: "Action1",
      },
    },
    {
      $: {
        Name: "diplicateOne",
        Action: "Action1",
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
  FunctionImport: [
    {
      $: {
        Name: "FunctionImport1",
        Function: "Function1",
      },
    },
  ],
  Singleton: [
    {
      $: {
        Name: "Singleton1",
        Type: "Type1",
      },
    },
    {
      $: {
        Name: "diplicateOne",
        Type: "Type1",
      },
    },
  ],
};

const sampleSchema = {
  resolveModelPath: sinon.stub(),
  getType: sinon.stub(),
};

describe("EntityContainer (oasis)", function () {
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
      assert.ok(_.isArray(container.actionImports));
      assert.ok(_.isArray(container.functionImports));
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

    it("resolves function imports", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.equal(
        container.resolveModelPath("FunctionImport1").name,
        "FunctionImport1"
      );
    });

    it("resolves action imports", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.equal(
        container.resolveModelPath("ActionImport1").name,
        "ActionImport1"
      );
    });

    it("resolves singletons", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.equal(container.resolveModelPath("Singleton1").name, "Singleton1");
    });

    it("throws error on unknown path", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.throws(() => container.resolveModelPath("missingOne").name);
    });

    it("throws error on ambiguous", function () {
      let container = new EntityContainer(sampleContainerMD);
      container.initSchemaDependentProperties(sampleSchema);
      assert.throws(() => container.resolveModelPath("diplicateOne").name);
    });
  });
});
