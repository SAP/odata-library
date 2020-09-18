"use strict";

const assert = require("assert");
const _ = require("lodash");
const sinon = require("sinon");
const FunctionImport = require("../../../../../lib/model/nw/dataSource/FunctionImport");
const sampleMD = {
  $: {
    EntitySet: "EntitySet1",
    HttpMethod: "GET",
    Name: "name",
    ReturnType: "Edm.String",
  },
  Parameter: [
    {
      $: {
        Mode: "In",
        Name: "name",
        Type: "Edm.String",
      },
    },
  ],
};

const entitySet = {};
const sampleSchema = {
  getEntityContainer: sinon.stub().returns({
    getEntitySet: sinon.stub().returns(entitySet),
  }),
  getType: (name) => ({
    namespaceQualifiedName: name,
  }),
};

describe("FunctionImport", function () {
  describe("#constructor()", function () {
    it("initializes properties from metadata", function () {
      let func = new FunctionImport(sampleMD, sampleSchema);
      assert.equal(func.entitySet, entitySet);
      assert.equal(func.httpMethod, "GET");
      assert.equal(func.name, "name");
      assert.equal(func.parameters.length, 1);
      assert.equal(func.raw, sampleMD);
      assert.equal(func.returnType.namespaceQualifiedName, "Edm.String");
      assert.ok(_.isArray(func.extensions));
    });

    describe(".getParameter()", function () {
      it("finds parameter", function () {
        let func = new FunctionImport(sampleMD, sampleSchema);
        assert.ok(func.getParameter("name"));
      });

      it("throw error when parameter is not available", function () {
        let func = new FunctionImport(sampleMD, sampleSchema);
        assert.throws(() => func.getParameter("noName"));
      });
    });

    it("uses correct defaults for missing parameters", function () {
      let func = new FunctionImport(
        {
          $: {
            Name: "name",
          },
        },
        sampleSchema
      );

      assert.equal(func.httpMethod, "GET");
      assert.equal(func.parameters.length, 0);
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements function import api", function () {
      let api = new FunctionImport(sampleMD, sampleSchema).getLegacyApiObject();
      assert.equal(api.HttpMethod, "GET");
      assert.equal(api.Name, "name");
      assert.equal(api.Parameter.length, 1);
      assert.equal(api.ReturnType, "Edm.String");
    });
  });
});
