"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const Batch = require("../../lib/agent/batch/Batch");
const ChangeSet = require("../../lib/agent/batch/ChangeSet");

let Service;
let service;

describe("Service", function () {
  let parse;
  let Agent;
  let metadataClass;
  let EntitySet;
  let FunctionImport;

  beforeEach(function () {
    parse = sinon.stub().returns("CONNECTION");
    Agent = sinon.stub();
    EntitySet = sinon.stub();
    FunctionImport = sinon.stub();
    metadataClass = {
      model: {
        version: "1.0",
      },
    };

    Agent.prototype.metadata = sinon.stub().returns(Promise.resolve([]));

    Service = proxyquire("../../lib/Service", {
      "./agent/settings": parse,
      "./agent/Agent": Agent,
      "./model/Metadata": sinon.stub().returns(metadataClass),
      "./engine/EntitySet": EntitySet,
      "./engine/FunctionImport": FunctionImport,
    });
    sinon.stub(Service.prototype, "initializeProperties");

    service = new Service("SETTINGS");

    assert(parse.calledWithExactly("SETTINGS"));
    assert(service.initializeProperties.calledWithExactly("CONNECTION"));

    Service.prototype.initializeProperties.restore();
  });

  describe(".initializeProperties()", function () {
    it("Properties are initialized", function () {
      sinon.stub(service, "buildEntitySets").returns("ENTITY_SETS");
      sinon.stub(service, "buildFunctionImports").returns("FUNCTION_IMPORTS");

      service.initializeProperties("CONNECTION");

      assert.ok(service.init instanceof Promise);
      assert.ok(service.metadata === undefined);
      assert.ok(service.agent instanceof Agent);
      assert.ok(Agent.getCall(0).calledWithExactly("CONNECTION"));

      return service.init.then(() => {
        assert.deepEqual(service.metadata, metadataClass);
        assert.equal(service.entitySets, "ENTITY_SETS");
        assert.equal(service.functionImports, "FUNCTION_IMPORTS");
        assert.ok(service.buildEntitySets.getCall(0).args[0] instanceof Agent);
        assert.deepEqual(
          service.buildEntitySets.getCall(0).args[1],
          metadataClass
        );
        assert.ok(
          service.buildFunctionImports.getCall(0).args[0] instanceof Agent
        );
        assert.deepEqual(
          service.buildFunctionImports.getCall(0).args[1],
          metadataClass
        );
      });
    });
  });

  describe(".buildEntitySets()", function () {
    it("Shorthand is not created for existing property in Service class", function () {
      let entitySets;
      let metadata = {
        model: {
          getSchema: () => ({
            getEntityContainer: () => ({
              entitySets: [
                {
                  name: "ENTITY_SET_NAME1",
                },
                {
                  name: "ENTITY_SET_NAME2",
                },
              ],
            }),
          }),
        },
      };
      let agent = {
        logger: {
          warn: sinon.spy(),
        },
      };
      service.ENTITY_SET_NAME2 = "FAKE";

      entitySets = service.buildEntitySets(agent, metadata);

      assert.ok(entitySets.ENTITY_SET_NAME1 instanceof EntitySet);
      assert.ok(service.ENTITY_SET_NAME1 instanceof EntitySet);
      assert.ok(entitySets.ENTITY_SET_NAME2 instanceof EntitySet);
      assert.equal(service.ENTITY_SET_NAME2, "FAKE");
      assert.ok(agent.logger.warn.called);
    });
  });

  describe(".buildFunctionImports()", function () {
    it("Instances and possible shorthands created", function () {
      let agent = {
        logger: {
          warn: sinon.spy(),
        },
      };

      let metadata = {
        model: {
          getSchema: () => ({
            getEntityContainer: () => ({
              functionImports: [
                {
                  name: "FUNCTION_IMPORT_NAME1",
                },
                {
                  name: "FUNCTION_IMPORT_NAME2",
                },
              ],
            }),
          }),
        },
      };

      service.FUNCTION_IMPORT_NAME2 = "FAKE";
      let functionImports = service.buildFunctionImports(agent, metadata);

      assert.ok(
        functionImports.FUNCTION_IMPORT_NAME1 instanceof FunctionImport
      );
      assert.ok(service.FUNCTION_IMPORT_NAME1 instanceof Function);

      assert.equal(service.FUNCTION_IMPORT_NAME2, "FAKE");
      assert.ok(agent.logger.warn.called);
    });
  });

  it(".createBatch()", function () {
    service.agent = {
      batchManager: {
        add: sinon.stub().returns("BATCH"),
      },
    };
    assert.equal(service.createBatch(), "BATCH");
  });

  it(".sendBatch()", function () {
    service.agent = {
      batch: sinon.stub().returns("PROMISE"),
    };
    assert.equal(service.sendBatch("BATCH", "RAW"), "PROMISE");
    assert.ok(service.agent.batch.calledWith("BATCH", "RAW"));
  });

  describe(".createChangeSet()", function () {
    let batchObject;

    beforeEach(function () {
      batchObject = {
        createChangeSet: sinon.stub(),
      };
    });

    it("use default batch to create changeset", function () {
      service.agent = {
        batchManager: {
          defaultBatch: batchObject,
        },
      };

      service.createChangeSet();
      assert.ok(batchObject.createChangeSet.called);
    });

    it("use explict batch to create changeset", function () {
      service.agent = {};

      service.createChangeSet(batchObject);
      assert.ok(batchObject.createChangeSet.called);
    });

    it("missing batch throws error", function () {
      service.agent = {};

      assert.throws(() => {
        service.createChangeSet();
      }, /Batch not found/);
    });
  });

  describe(".commitChangeSet()", function () {
    it("use explicit batch to get default changeset", function () {
      let batchObject = new Batch();
      let changeSet = batchObject.createChangeSet();

      service.commitChangeSet(batchObject);
      assert.strictEqual(changeSet.commited, true);
    });
    it("use explicit changeset", function () {
      let changeSet = new ChangeSet();

      service.commitChangeSet(changeSet);
      assert.strictEqual(changeSet.commited, true);
    });
    it("the use default changeset from the default batch", function () {
      let batchObject = new Batch();

      service.agent = {
        batchManager: {
          defaultBatch: batchObject,
        },
      };
      let changeSet = batchObject.createChangeSet();

      service.commitChangeSet();
      assert.strictEqual(changeSet.commited, true);
    });
    it("missing a default batch", function () {
      assert.throws(function () {
        service.commitChangeSet();
      }, /Batch not found/);
    });
    it("missing a default changeset", function () {
      let batchObject = new Batch();

      service.agent = {
        batchManager: {
          defaultBatch: batchObject,
        },
      };
      assert.throws(() => {
        service.commitChangeSet();
      }, /ChangeSet not found/);
    });
    it("invalid batch object passed", function () {
      assert.throws(() => {
        service.commitChangeSet({});
      }, /Invalid/);
    });
  });
});
