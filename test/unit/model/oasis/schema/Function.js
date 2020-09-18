"use strict";

const _ = require("lodash");
const assert = require("assert");
const FunctionDef = require("../../../../../lib/model/oasis/schema/Function");
const sampleMD = {
  $: {
    Name: "Function1",
    IsBound: "true",
    IsComposable: "true",
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
    Name: "Function1",
  },
  ReturnType: [
    {
      $: {
        Type: "type",
      },
    },
  ],
};

const type = {
  namespaceQualifiedName: "Type",
};

const schema = {
  namespace: "ns",
  getType: () => type,
};

describe("Function", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let fn = new FunctionDef(sampleMD);
      assert.equal(fn.raw, sampleMD);
      assert.equal(fn.name, "Function1");
      assert.ok(fn.isBound);
      assert.ok(fn.isComposable);
      assert.equal(fn.entitySetPath, "path");
      assert.ok(_.isArray(fn.parameters));
    });

    it("uses properties' defaults", function () {
      let fn = new FunctionDef(sampleMinimalMD);
      assert.equal(fn.raw, sampleMinimalMD);
      assert.equal(fn.name, "Function1");
      assert.ok(!fn.isBound);
      assert.ok(!fn.isComposable);
      assert.ok(_.isArray(fn.parameters));
    });

    it("throws error on missing name or return type", function () {
      assert.throws(
        () =>
          new FunctionDef({
            $: {},
            ReturnType: [
              {
                $: {
                  Type: "type",
                },
              },
            ],
          })
      );
      assert.throws(
        () =>
          new FunctionDef({
            $: {
              Name: "Function1",
            },
          })
      );
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("initializes return type and parameters", function () {
      let fn = new FunctionDef(sampleMD);
      fn.initSchemaDependentProperties(schema);
      assert.equal(fn.returnType.type, type);
      assert.equal(fn.parameters[0].type, type);
    });
  });
});
