"use strict";

const _ = require("lodash");
const assert = require("assert");
const sandbox = require("sinon").createSandbox();
const FunctionDef = require("../../../../../lib/model/oasis/schema/Function");
const BoundObject = require("../../../../../lib/model/oasis/schema/BoundObject");

const sampleMD = JSON.stringify({
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
});

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

describe("Function", function () {
  let functionImportType;

  beforeEach(() => {
    functionImportType = new FunctionDef(JSON.parse(sampleMD));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("#constructor()", function () {
    it("initializes properties", function () {
      functionImportType = new FunctionDef(JSON.parse(sampleMD));
      assert.deepEqual(functionImportType.raw, JSON.parse(sampleMD));
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

  it("._checkConsistency()", function () {
    sandbox.stub(BoundObject.prototype, "_checkConsistency");
    functionImportType._checkConsistency();
    assert.ok(BoundObject.prototype._checkConsistency.args, [[]]);

    functionImportType.raw.ReturnType = [];
    assert.throws(
      () => functionImportType._checkConsistency(),
      /Function Function1 must contain one ReturnType element/
    );

    functionImportType.raw.ReturnType = [1, 2];
    assert.throws(
      () => functionImportType._checkConsistency(),
      /Function Function1 must contain one ReturnType element/
    );
  });
});
