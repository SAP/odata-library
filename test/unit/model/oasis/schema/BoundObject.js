"use strict";

const _ = require("lodash");
const assert = require("assert");
const BoundObject = require("../../../../../lib/model/oasis/schema/BoundObject");
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

describe("BoundObject", function () {
  let boundObjectType;
  beforeEach(() => {
    boundObjectType = new BoundObject(sampleMD);
  });
  describe("#constructor()", function () {
    it("initializes properties", function () {
      boundObjectType = new BoundObject(sampleMD);
      assert.equal(boundObjectType.raw, sampleMD);
      assert.equal(boundObjectType.name, "Function1");
      assert.ok(boundObjectType.isBound);
      assert.equal(boundObjectType.entitySetPath, "path");
      assert.ok(_.isArray(boundObjectType.parameters));
    });

    it("uses properties' defaults", function () {
      boundObjectType = new BoundObject(sampleMinimalMD);
      assert.equal(boundObjectType.raw, sampleMinimalMD);
      assert.equal(boundObjectType.name, "Function1");
      assert.ok(!boundObjectType.isBound);
      assert.ok(!boundObjectType.isComposable);
      assert.ok(_.isArray(boundObjectType.parameters));
    });

    it("throws error on missing name or return type", function () {
      assert.throws(
        () =>
          new BoundObject({
            $: {},
          })
      );
    });
  });

  it(".initSchemaDependentProperties", function () {
    boundObjectType.initSchemaDependentProperties(schema);
    assert.equal(boundObjectType.returnType.type, type);
    assert.equal(boundObjectType.parameters[0].type, type);
    assert.equal(boundObjectType.boundType, type);
    assert.equal(boundObjectType.schema, schema);
  });

  it(".initSchemaDependentProperties without returnType", function () {
    const minimalMD = {
      $: { Name: "Function1" },
      ReturnType: [{ $: { Type: "type" } }],
    };
    const bo = new BoundObject(minimalMD);
    bo.initSchemaDependentProperties(schema);
    assert.equal(bo.schema, schema);
  });

  it(".initSchemaDependentProperties without any returnType (covers false branch of has returnType)", function () {
    const noReturnTypeMD = {
      $: { Name: "Function1" },
    };
    const bo = new BoundObject(noReturnTypeMD);
    bo.initSchemaDependentProperties(schema);
    assert.equal(bo.schema, schema);
    assert.equal(bo.returnType, undefined);
  });

  it(".resolveModelPath()", function () {
    assert.strictEqual(boundObjectType.resolveModelPath(), boundObjectType);
  });

  it("._checkConsistency()", function () {
    assert.throws(
      () => BoundObject.prototype._checkConsistency.call(context),
      /Name attribute is mandatory for action/
    );
  });
});
