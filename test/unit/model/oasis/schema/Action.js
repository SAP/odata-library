"use strict";

const assert = require("assert");
const sinon = require("sinon");
const Action = require("../../../../../lib/model/oasis/schema/Action");
const BoundObject = require("../../../../../lib/model/oasis/schema/BoundObject");
const EntityType = require("../../../../../lib/model/oasis/schema/EntityType");
const sandbox = sinon.createSandbox();

describe("Action", function () {
  let actionType;
  let sampleMD;
  beforeEach(() => {
    sampleMD = {
      $: {
        Name: "Action1",
        IsBound: "true",
        EntitySetPath: "path",
      },
      Parameter: [
        {
          $: {},
        },
        {
          $: {
            Name: "path",
          },
          type: "boundType",
        },
        {
          $: {
            Name: "_it",
          },
          type: "EntityType1",
        },
      ],
      ReturnType: [
        {
          $: {
            Type: "type",
          },
        },
      ],
    };
    actionType = new Action(sampleMD);
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("._checkConsistency()", function () {
    sandbox.stub(BoundObject.prototype, "_checkConsistency");
    actionType._checkConsistency();
    assert.ok(BoundObject.prototype._checkConsistency.args, [[]]);

    actionType.raw.ReturnType = [];
    assert.throws(
      () => actionType._checkConsistency(),
      /Action Action1 may contain at most one ReturnType element/
    );

    actionType.raw.ReturnType = [1, 2];
    assert.throws(
      () => actionType._checkConsistency(),
      /Action Action1 may contain at most one ReturnType element/
    );
  });

  describe("matchModelPath", function () {
    beforeEach(() => {
      sinon.stub(actionType, "isBoundByType").returns(false);
      actionType.isBoundByType.withArgs("EntityType1").returns(true);
    });
    it("match simple action path", function () {
      assert.equal(actionType.matchModelPath({ element: "Action1" }), true);
    });
    it("match typed action path", function () {
      assert.equal(
        actionType.matchModelPath({ element: "Action1(EntityType1)" }),
        true
      );
    });
    it("missing type for typed action path", function () {
      assert.equal(
        actionType.matchModelPath({ element: "Action1(EntityType2)" }),
        false
      );
    });
  });

  describe("isBoundByType", function () {
    it("bound with prefix with namespace", function () {
      actionType.parameters[2].type = new EntityType({
        $: { Name: "EntityType1" },
      });
      actionType.schema = {
        namespace: "ns",
      };
      assert.equal(actionType.isBoundByType("ns.EntityType1"), true);
    });
    it("bound with prefix with alias", function () {
      actionType.parameters[2].type = new EntityType({
        $: { Name: "EntityType1" },
      });
      actionType.schema = {
        alias: "ns",
      };
      assert.equal(actionType.isBoundByType("ns.EntityType1"), true);
    });
    it("invalid prefix", function () {
      actionType.parameters[2].type = new EntityType({
        $: { Name: "EntityType1" },
      });
      actionType.schema = {
        alias: "SAP__self",
      };
      assert.equal(actionType.isBoundByType("ns.EntityType1"), false);
    });
    it("missing schema", function () {
      actionType.parameters[2].type = new EntityType({
        $: { Name: "EntityType1" },
      });
      assert.equal(actionType.isBoundByType("ns.EntityType1"), false);
    });
  });
});
