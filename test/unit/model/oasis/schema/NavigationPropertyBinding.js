"use strict";

const assert = require("assert");
const NavigationPropertyBinding = require("../../../../../lib/model/oasis/schema/NavigationPropertyBinding");

describe("EnumTypeMemeber", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let npb = new NavigationPropertyBinding({
        $: {
          Path: "p",
          Target: "t",
        },
      });

      assert.equal(npb.path, "p");
      assert.equal(npb.target, "t");
    });
    it("throws error if path is missing", function () {
      assert.throws(() => {
        let npb = new NavigationPropertyBinding({
          $: {
            Target: "t",
          },
        });
        assert.ok(npb);
      });
    });

    it("throws error if target is missing", function () {
      assert.throws(() => {
        let npb = new NavigationPropertyBinding({
          $: {
            Path: "p",
          },
        });
        assert.ok(npb);
      });
    });
  });
});
