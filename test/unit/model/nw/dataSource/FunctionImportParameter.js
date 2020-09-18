"use strict";

const assert = require("assert");
const _ = require("lodash");
const FunctionImportParameter = require("../../../../../lib/model/nw/dataSource/FunctionImportParameter");
const sampleMD = {
  $: {
    MaxLength: "10",
    Mode: "In",
    Name: "name",
    Nullable: "false",
    Precision: "1",
    Scale: "1",
    Type: "Edm.String",
  },
};

const sampleSchema = {
  getType: (name) => ({
    namespaceQualifiedName: name,
  }),
};

describe("FunctionImportParameter", function () {
  describe("#constructor()", function () {
    it("initializes properties from metadata", function () {
      let param = new FunctionImportParameter(sampleMD, sampleSchema);
      assert.equal(param.raw, sampleMD);
      assert.equal(param.maxLength, 10);
      assert.equal(param.mode, "In");
      assert.equal(param.name, "name");
      assert.equal(param.nullable, false);
      assert.equal(param.precision, 1);
      assert.equal(param.scale, 1);
      assert.equal(param.type.namespaceQualifiedName, "Edm.String");
      assert.ok(_.isArray(param.extensions));
    });

    it("uses correct defaults for missing parameters", function () {
      let param = new FunctionImportParameter(
        {
          $: {
            Mode: "In",
            Name: "name",
            Type: "Edm.String",
          },
        },
        sampleSchema
      );

      assert.equal(param.name, "name");
      assert.equal(param.maxLength, undefined);
      assert.equal(param.mode, "In");
      assert.equal(param.name, "name");
      assert.equal(param.nullable, true);
      assert.equal(param.precision, undefined);
      assert.equal(param.scale, undefined);
      assert.equal(param.type.namespaceQualifiedName, "Edm.String");
    });

    it("throws error on invalid metadata", function () {
      assert.throws(
        () =>
          new FunctionImportParameter(
            {
              $: {
                Mode: "None",
                Name: "name",
                Type: "Edm.String",
              },
            },
            sampleSchema
          )
      );
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements function import api", function () {
      let api = new FunctionImportParameter(
        sampleMD,
        sampleSchema
      ).getLegacyApiObject();
      assert.equal(api.Name, "name");
      assert.equal(api.MaxLength, 10);
      assert.equal(api.Mode, "In");
      assert.equal(api.Name, "name");
      assert.equal(api.Nullable, false);
      assert.equal(api.Precision, 1);
      assert.equal(api.Scale, 1);
      assert.equal(api.Type, "Edm.String");
    });
  });
});
