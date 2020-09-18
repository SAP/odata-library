"use strict";

const assert = require("assert");
const AssociationEnd = require("../../../../../lib/model/nw/schema/AssociationEnd");

describe("AssociationEnd", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let end = new AssociationEnd({
        $: {
          Type: "type",
          Multiplicity: "multiplicity",
          Role: "role",
        },
      });

      let type = {};
      end.initSchemaDependentProperties({
        getType: () => type,
      });
      assert.equal(end.type, type);
      assert.equal(end.multiplicity, "multiplicity");
      assert.equal(end.role, "role");
    });
  });
});
