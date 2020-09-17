"use strict";

const assert = require("assert");
const sinon = require("sinon");
const FunctionImport = require("../../../../../lib/model/oasis/dataSource/FunctionImport");
const sampleMD = {
  $: {
    Name: "name",
    Function: "function",
    EntitySet: "entitySet",
    IncludeInServiceDocument: "true",
  },
};

const fn = {};
const sampleSchema = {
  resolveModelPath: sinon.stub().returns(fn),
};

describe("FunctionImport (oasis)", function () {
  describe("#constructor()", function () {
    it("initializes basic properties", function () {
      let fi = new FunctionImport(sampleMD, sampleSchema);
      assert.equal(fi.raw, sampleMD);
      assert.equal(fi.name, "name");
      assert.equal(fi.function, fn);
      assert.ok(fi.includeInServiceDocument);
      assert.ok(fi.entitySet, "entitySet");
    });

    it("throws error on missing name or function", function () {
      assert.throws(
        () =>
          new FunctionImport({
            $: {
              Function: "function",
            },
          })
      );

      assert.throws(
        () =>
          new FunctionImport({
            $: {
              Name: "name",
            },
          })
      );
    });
  });
});
