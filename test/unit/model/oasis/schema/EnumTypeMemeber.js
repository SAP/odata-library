"use strict";

const _ = require("lodash");
const assert = require("assert");
const EnumTypeMemeber = require("../../../../../lib/model/oasis/schema/EnumTypeMemeber");

describe("EnumTypeMemeber", function () {
  describe("#constructor()", function () {
    it("throws error if name is missing", function () {
      assert.throws(() => {
        let em = new EnumTypeMemeber({
          $: {},
        });
        assert.ok(em);
      });
    });

    it("stores value attribute", function () {
      let em = new EnumTypeMemeber({
        $: {
          Name: "n",
          Value: "1",
        },
      });

      assert.equal(em.value, 1);
    });

    it("doesn't create value property if value not specified", function () {
      let em = new EnumTypeMemeber({
        $: {
          Name: "n",
        },
      });

      assert.ok(!_.has(em, "value"));
    });
  });
});
