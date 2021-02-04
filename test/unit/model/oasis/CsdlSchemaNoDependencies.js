"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const sandbox = sinon.createSandbox();

describe("CsdlSchema", function () {
  let rawMetadata = {
    $: {
      Alias: "ALIAS",
      Namespace: "NAMESPACE",
    },
    Annotations: "ANNOTATIONS",
  };
  let settings = {};
  let schema;
  let CsdlSchema;
  let EnumType = sinon.stub();

  beforeEach(function () {
    CsdlSchema = proxyquire("../../../../lib/model/oasis/CsdlSchema", {
      "./schema/EnumType": EnumType,
    });
    sandbox.stub(CsdlSchema.prototype, "applyAnnotations");
    sandbox.stub(CsdlSchema, "initChildProperties");
    sandbox.stub(CsdlSchema, "initSchemaDependentProperties");
    schema = new CsdlSchema(rawMetadata, settings, "META_MODEL");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it(".constructor()", function () {
    assert.equal(schema.raw, rawMetadata);
    assert.equal(schema.settings, settings);
    assert.equal(schema.alias, "ALIAS");
    assert.equal(schema.namespace, "NAMESPACE");
    assert.deepEqual(schema.extensions, []);
    assert.ok(CsdlSchema.initChildProperties.calledWith(schema, "META_MODEL"));
    assert.ok(CsdlSchema.initSchemaDependentProperties.calledWith(schema));
    assert.ok(schema.applyAnnotations.calledWith("ANNOTATIONS"));
  });

  describe("#initChildProperties()", function () {
    it("empty child property", () => {
      schema = {
        raw: {
          EnumType: [],
        },
      };
      CsdlSchema.initChildProperties.restore();
      CsdlSchema.initChildProperties(schema, "RAW_METADATA");
      assert.deepEqual(schema.enumTypes, []);
    });
    it("correctly create child", () => {
      schema = {
        raw: {
          EnumType: ["ENUM"],
        },
      };
      CsdlSchema.initChildProperties.restore();
      CsdlSchema.initChildProperties(schema, "RAW_METADATA");
      assert.strictEqual(schema.enumTypes.length, 1);
      assert.ok(EnumType.calledWith("ENUM", "RAW_METADATA"));
    });
  });
});
