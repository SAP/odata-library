"use strict";

const assert = require("assert");
const EnumType = require("../../../../../lib/model/oasis/schema/EnumType");

describe("EnumTypeMemeber", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let em = new EnumType({
        $: {
          IsFlags: "true",
          Name: "n",
          UnderlyingType: "Edm.Byte",
        },
        Memeber: [],
      });
      assert.ok(em.isFlags);
      assert.equal(em.underlyingType, "Edm.Byte");
    });

    it("uses property defaults", function () {
      let em = new EnumType({
        $: {
          Name: "n",
        },
        Memeber: [],
      });
      assert.equal(em.isFlags, false);
      assert.equal(em.underlyingType, "Edm.Int32");
    });

    it("throws error if name is missing", function () {
      assert.throws(() => {
        let em = new EnumType({
          $: {
            Name: "n",
            UnderlyingType: "None",
          },
        });
        assert.ok(em);
      });
    });

    it("throws error if wrong underlying type is used", function () {
      assert.throws(() => {
        let em = new EnumType({
          $: {},
        });
        assert.ok(em);
      });
    });

    it("throws error on value usage inconsistency", function () {
      assert.throws(() => {
        let em = new EnumType({
          $: {
            Name: "n",
          },
          Memeber: [
            {
              $: {
                Name: "n1",
                Value: "1",
              },
            },
            {
              $: {
                Name: "n2",
              },
            },
          ],
        });

        assert.ok(em);
      });
    });

    it("throws error if values for flags is missing", function () {
      assert.throws(() => {
        let em = new EnumType({
          $: {
            IsFlags: "true",
            Name: "n",
          },
          Memeber: [
            {
              $: {
                Name: "n1",
              },
            },
          ],
        });

        assert.ok(em);
      });
    });
  });
});
