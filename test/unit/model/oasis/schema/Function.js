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
  let functionImportType;
  beforeEach(() => {
    functionImportType = new FunctionDef(sampleMD);
  });
  describe("#constructor()", function () {
    it("initializes properties", function () {
      functionImportType = new FunctionDef(sampleMD);
      assert.equal(functionImportType.raw, sampleMD);
      assert.equal(functionImportType.name, "Function1");
      assert.ok(functionImportType.isBound);
      assert.ok(functionImportType.isComposable);
      assert.equal(functionImportType.entitySetPath, "path");
      assert.ok(_.isArray(functionImportType.parameters));
    });

    it("uses properties' defaults", function () {
      functionImportType = new FunctionDef(sampleMinimalMD);
      assert.equal(functionImportType.raw, sampleMinimalMD);
      assert.equal(functionImportType.name, "Function1");
      assert.ok(!functionImportType.isBound);
      assert.ok(!functionImportType.isComposable);
      assert.ok(_.isArray(functionImportType.parameters));
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
      functionImportType.initSchemaDependentProperties(schema);
      assert.equal(functionImportType.returnType.type, type);
      assert.equal(functionImportType.parameters[0].type, type);
    });
  });

  it(".resolveModelPath()", function () {
    assert.strictEqual(
      functionImportType.resolveModelPath(),
      functionImportType
    );
  });
});
