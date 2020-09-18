"use strict";

const assert = require("assert");

const ExtenderBase = require("../../../../../../lib/model/nw/extensions/sap/ExtenderBase");

describe("ExtenderBase", function () {
  describe("apply()", function () {
    it("applies sap schema extensions to schema (default)", function () {
      let schema = {
        entityContainers: [],
        entityTypes: [],
        extensions: [],
        raw: {},
      };

      ExtenderBase.applyAttributeExtension(
        schema,
        ExtenderBase.ATTRIBUTES_SCHEMA
      );

      assert.equal(schema.sap.schemaVersion, "0000");
    });

    it("applies sap schema extensions to schema (explicit)", function () {
      let schema = {
        entityContainers: [],
        entityTypes: [],
        extensions: [],
        raw: {
          $: {
            "sap:schema-version": "1",
          },
        },
      };

      ExtenderBase.applyAttributeExtension(
        schema,
        ExtenderBase.ATTRIBUTES_SCHEMA
      );

      assert.equal(schema.sap.schemaVersion, "1");
    });
  });
});
