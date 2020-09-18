"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const Batch = require("../../../../lib/agent/batch/Batch");

describe("agent/batch/Manager", function () {
  let Manager;
  let Base;
  let manager;

  beforeEach(function () {
    let listNameCheck;

    Base = function (listName) {
      listNameCheck = listName;
      this.batches = [];
    };
    Base.prototype.add = sinon.stub();

    Manager = proxyquire("../../../../lib/agent/batch/Manager", {
      "./Base": Base,
    });

    manager = new Manager();
    assert.equal(listNameCheck, "batches");
  });

  it(".add", function () {
    manager.add();
    assert.ok(Base.prototype.add.calledWith(Batch));
  });

  it(".remove", function () {
    sinon.stub(manager, "indexOf").returns(2);
    manager.batches.push("BATCH_1");
    manager.batches.push("BATCH_2");
    manager.batches.push("BATCH_3");
    manager.remove("BATCH_3");
    assert.ok(manager.indexOf.calledWithExactly("BATCH_3"));
    assert.deepEqual(manager.batches, ["BATCH_1", "BATCH_2"]);
  });

  it(".has", function () {
    sinon.stub(manager, "indexOf").returns(2);
    assert.ok(!manager.has("BATCH_3"));
    manager.batches.push("BATCH_1");
    manager.batches.push("BATCH_2");
    manager.batches.push("BATCH_3");
    assert.ok(manager.has("BATCH_3"));
    manager.indexOf.returns(-1);
    assert.ok(!manager.has("BATCH_3"));
  });

  describe(".indexOf", function () {
    it("Missing batch", function () {
      let notExistsBatch = new Batch();
      manager.batches.push(new Batch());
      assert.strictEqual(manager.indexOf(notExistsBatch), -1);
    });

    it("Existing batch", function () {
      manager.batches.push(new Batch());
      manager.batches.push(new Batch());
      manager.batches.push(new Batch());
      assert.strictEqual(manager.indexOf(manager.batches[0]), 0);
      assert.strictEqual(manager.indexOf(manager.batches[1]), 1);
      assert.strictEqual(manager.indexOf(manager.batches[2]), 2);
    });

    it("Invalid batch object", function () {
      assert.throws(() => {
        manager.indexOf({});
      }, /Only/);
    });
  });

  describe(".defaultBatch", function () {
    it("Missing default batch", function () {
      assert.strictEqual(manager.defaultBatch, undefined);
    });

    it("Existing default batch", function () {
      manager.batches.push(new Batch());
      manager.batches.push(new Batch());
      manager.batches.push(new Batch());
      assert.strictEqual(manager.defaultBatch, manager.batches[0]);
    });
  });

  describe(".defaultChangeSet", function () {
    it("Missing default batch causes missing default changeset", function () {
      assert.strictEqual(manager.defaultBatch, undefined);
    });

    it("Existing default changeset in default batch", function () {
      let testBatch = new Batch();
      let testChangeSet;
      testBatch.createChangeSet();
      testBatch.createChangeSet();
      testChangeSet = testBatch.requests[0];
      manager.batches.push(testBatch);
      manager.batches.push(new Batch());
      assert.strictEqual(manager.defaultChangeSet, testChangeSet);
    });
  });
});
