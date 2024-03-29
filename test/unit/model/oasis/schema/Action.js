"use strict";

const _ = require("lodash");
const assert = require("assert");
const Action = require("../../../../../lib/model/oasis/schema/Action");
const sampleMD = {
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
  ],
  ReturnType: [
    {
      $: {
        Type: "type",
      },
    },
  ],
};

const sampleMinimalMD = {
  $: {
    Name: "Action1",
  },
};

const type = {
  namespaceQualifiedName: "Type",
};

const schema = {
  namespace: "ns",
  getType: () => type,
};

describe("Action", function () {
  let actionType;
  beforeEach(() => {
    actionType = new Action(sampleMD);
  });
  describe("#constructor()", function () {
    it("initializes properties", function () {
      assert.equal(actionType.raw, sampleMD);
      assert.equal(actionType.name, "Action1");
      assert.ok(actionType.isBound);
      assert.equal(actionType.entitySetPath, "path");
      assert.ok(_.isArray(actionType.parameters));
    });

    it("uses properties' defaults", function () {
      actionType = new Action(sampleMinimalMD);
      assert.equal(actionType.raw, sampleMinimalMD);
      assert.equal(actionType.name, "Action1");
      assert.ok(!actionType.isBound);
      assert.ok(_.isArray(actionType.parameters));
    });

    it("throws error on missing name or multiple return type", function () {
      assert.throws(
        () =>
          new Action({
            $: {},
          })
      );
      assert.throws(
        () =>
          new Action({
            $: {
              Name: "Action1",
            },
            ReturnType: [
              {
                $: {
                  Type: "type1",
                },
              },
              {
                $: {
                  Type: "type2",
                },
              },
            ],
          })
      );
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("initializes return type and parameters", function () {
      actionType.initSchemaDependentProperties(schema);
      assert.equal(actionType.returnType.type, type);
      assert.equal(actionType.parameters[0].type, type);
      assert.equal(actionType.boundType, type);

      actionType = new Action(sampleMinimalMD);
      actionType.initSchemaDependentProperties(schema);

      const p1 = {
        $: {
          Name: "P1",
        },
      };
      actionType = new Action({
        $: {
          Name: "Action1",
          IsBound: "true",
        },
        Parameter: [
          p1,
          {
            $: {
              Name: "P2",
            },
          },
        ],
      });
      actionType.initSchemaDependentProperties(schema);
      assert.equal(actionType.boundType, type);
    });
  });

  it(".resolveModelPath()", function () {
    assert.strictEqual(actionType.resolveModelPath(), actionType);
  });
});
