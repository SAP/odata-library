"use strict";

const assert = require("assert");
const OnDeleteAction = require("../../../../../lib/model/oasis/schema/OnDeleteAction");

describe("OnDeleteAction", function () {
  describe("#constructor()", function () {
    it("accepts valid action", function () {
      let od = new OnDeleteAction({
        $: {
          Action: "Cascade",
        },
      });
      assert.equal(od.action, "Cascade");
    });

    it("throws error if action is missing", function () {
      assert.throws(
        () =>
          new OnDeleteAction({
            $: {},
          })
      );
    });

    it("throws error if action has invalid value", function () {
      assert.throws(
        () =>
          new OnDeleteAction({
            $: {
              Action: "something",
            },
          })
      );
    });
  });
});
