"use strict";

const assert = require("assert");
const ReferentialConstraint = require("../../../../../lib/model/oasis/schema/ReferentialConstraint");

describe("ReferentialConstraint", function () {
  describe("#constructor()", function () {
    it("accepts valid values", function () {
      let c = new ReferentialConstraint({
        $: {
          Property: "prop1",
          ReferencedProperty: "prop2",
        },
      });
      assert.equal(c.property, "prop1");
      assert.equal(c.referencedProperty, "prop2");
    });

    it("throws error if property is missing", function () {
      assert.throws(
        () =>
          new ReferentialConstraint({
            $: {
              ReferencedProperty: "prop2",
            },
          })
      );
    });

    it("throws error if ReferencedProperty is missing", function () {
      assert.throws(
        () =>
          new ReferentialConstraint({
            $: {
              Property: "prop1",
            },
          })
      );
    });
  });
});
