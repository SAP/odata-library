"use strict";

const assert = require("assert");
const sinon = require("sinon");
const ActionImport = require("../../../../../lib/model/oasis/dataSource/ActionImport");
const sampleMD = {
  $: {
    Name: "name",
    Action: "action",
    EntitySet: "entitySet",
  },
};

const action = {};
const sampleSchema = {
  resolveModelPath: sinon.stub().returns(action),
};

describe("ActionImport (oasis)", function () {
  describe("#constructor()", function () {
    it("initializes basic properties", function () {
      let ai = new ActionImport(sampleMD, sampleSchema);
      assert.equal(ai.raw, sampleMD);
      assert.equal(ai.name, "name");
      assert.equal(ai.action, action);
      assert.ok(ai.entitySet, "entitySet");
    });

    it("throws error on missing name or action", function () {
      assert.throws(
        () =>
          new ActionImport({
            $: {
              Action: "action",
            },
          })
      );

      assert.throws(
        () =>
          new ActionImport({
            $: {
              Name: "name",
            },
          })
      );
    });
  });
});
