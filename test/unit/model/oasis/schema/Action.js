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

    describe("entityTypePath", function () {
      it("EntitySetPath is defined", function () {
        let action = new Action({
          $: {
            Name: "ACTION1",
            IsBound: "true",
            EntitySetPath: "PATH",
          },
          Parameter: [
            {
              $: { Name: "Parameter1" },
            },
            {
              $: { Name: "PATH", Type: "ENTTY_TYPE_PATH" },
            },
          ],
          ReturnType: [
            {
              $: {
                Type: "type",
              },
            },
          ],
        });
        assert.strictEqual(action.entityTypePath, "ENTTY_TYPE_PATH");
      });
      it("EntitySetPath is missing", function () {
        let action = new Action({
          $: {
            Name: "ACTION1",
            IsBound: "true",
          },
          Parameter: [
            {
              $: { Name: "Parameter1" },
            },
            {
              $: { Name: "_it", Type: "ENTTY_TYPE_PATH" },
            },
          ],
          ReturnType: [
            {
              $: {
                Type: "type",
              },
            },
          ],
        });
        assert.strictEqual(action.entityTypePath, "ENTTY_TYPE_PATH");
      });
    });

    describe("entityType", function () {
      it("EntityType is defined as single entity", function () {
        let action = new Action({
          $: {
            Name: "ACTION1",
            IsBound: "true",
          },
          Parameter: [
            {
              $: { Name: "Parameter1" },
            },
            {
              $: { Name: "_it", Type: "ENTTY_TYPE" },
            },
          ],
          ReturnType: [
            {
              $: {
                Type: "type",
              },
            },
          ],
        });
        assert.strictEqual(action.entityType, "ENTTY_TYPE");
      });
      it("EntityType is defined as collection", function () {
        let action = new Action({
          $: {
            Name: "ACTION1",
            IsBound: "true",
          },
          Parameter: [
            {
              $: { Name: "Parameter1" },
            },
            {
              $: { Name: "_it", Type: "Collection(ENTTY_TYPE)" },
            },
          ],
          ReturnType: [
            {
              $: {
                Type: "type",
              },
            },
          ],
        });
        assert.strictEqual(action.entityType, "ENTTY_TYPE");
      });
      it("EntityType is defined as non string", function () {
        let action = new Action({
          $: {
            Name: "ACTION1",
            IsBound: "true",
          },
          Parameter: [
            {
              $: { Name: "Parameter1" },
            },
            {
              $: { Name: "_it", Type: 1 },
            },
          ],
          ReturnType: [
            {
              $: {
                Type: "type",
              },
            },
          ],
        });
        assert.strictEqual(action.entityType, 1);
      });
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

      actionType = new Action(sampleMinimalMD);
      actionType.initSchemaDependentProperties(schema);
    });
  });

  it(".resolveModelPath()", function () {
    assert.strictEqual(actionType.resolveModelPath(), actionType);
  });
});
