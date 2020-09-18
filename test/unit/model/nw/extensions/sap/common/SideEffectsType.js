"use strict";

const assert = require("assert");
const SideEffectsType = require("../../../../../../../lib/model/nw/extensions/sap/common/SideEffectsType");

let annotation = {
  record: {
    value: {
      SourceEntities: {
        collection: ["a"],
      },
      SourceProperties: {
        collection: ["a"],
      },
      TargetEntities: {
        collection: ["a", "b"],
      },
      TargetProperties: {
        collection: ["a", "b"],
      },
    },
  },
};

let entityType = {
  getNavigationProperty: () => "navProp",
  getProperty: () => "prop",
};

describe("SideEffectsType", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let sideEffects = new SideEffectsType(annotation, entityType);

      assert.equal(sideEffects.annotation, annotation);

      assert.ok(sideEffects.hasOwnProperty("sourceEntities"));
      assert.ok(sideEffects.hasOwnProperty("sourceProperties"));
      assert.ok(sideEffects.hasOwnProperty("targetEntities"));
      assert.ok(sideEffects.hasOwnProperty("targetProperties"));

      assert.strictEqual(sideEffects.sourceEntities.length, 1);
      assert.strictEqual(sideEffects.sourceProperties.length, 1);
      assert.strictEqual(sideEffects.targetEntities.length, 2);
      assert.strictEqual(sideEffects.targetProperties.length, 2);

      assert.strictEqual(sideEffects.sourceEntities[0], "navProp");
      assert.strictEqual(sideEffects.sourceProperties[0], "prop");
      assert.strictEqual(sideEffects.targetEntities[0], "navProp");
      assert.strictEqual(sideEffects.targetProperties[0], "prop");
    });
  });
});
