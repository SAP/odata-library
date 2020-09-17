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
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let fn = new Action(sampleMD);
      assert.equal(fn.raw, sampleMD);
      assert.equal(fn.name, "Action1");
      assert.ok(fn.isBound);
      assert.equal(fn.entitySetPath, "path");
      assert.ok(_.isArray(fn.parameters));
    });

    it("uses properties' defaults", function () {
      let fn = new Action(sampleMinimalMD);
      assert.equal(fn.raw, sampleMinimalMD);
      assert.equal(fn.name, "Action1");
      assert.ok(!fn.isBound);
      assert.ok(_.isArray(fn.parameters));
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
      let fn = new Action(sampleMD);
      fn.initSchemaDependentProperties(schema);
      assert.equal(fn.returnType.type, type);
      assert.equal(fn.parameters[0].type, type);

      fn = new Action(sampleMinimalMD);
      fn.initSchemaDependentProperties(schema);
    });
  });
});
