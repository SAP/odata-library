"use strict";

const _ = require("lodash");
const assert = require("assert");
const Association = require("../../../../../lib/model/nw/schema/Association");
const AssociationEnd = require("../../../../../lib/model/nw/schema/AssociationEnd");

const sampleAssociationMD = {
  $: {
    Name: "A1",
  },
  End: [
    {
      $: {},
    },
    {
      $: {},
    },
  ],
};

describe("Association", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let assoc = new Association(sampleAssociationMD);
      assert.equal(assoc.raw, sampleAssociationMD);
      assert.equal(assoc.name, "A1");
      assert.ok(_.isArray(assoc.ends));
      assert.equal(assoc.ends.length, 2);
    });

    it("checks End definition validity", function () {
      assert.throws(
        () =>
          new Association({
            $: {},
          })
      );
    });
  });

  describe(".resolveModelPath()", function () {
    it("resolves itself", function () {
      let assoc = new Association(sampleAssociationMD);
      assert.equal(assoc.resolveModelPath("A1"), assoc);
      assert.equal(assoc.resolveModelPath(), assoc);
      assert.equal(assoc.resolveModelPath("XXX"), undefined);
    });
  });

  it(".findEnd()", function () {
    let association = new Association({
      $: {
        Name: "A1",
      },
      End: [
        {
          $: {
            Role: "ROLE_IDENTIFIER",
          },
        },
        {
          $: {},
        },
      ],
    });
    assert.ok(association.findEnd("ROLE_IDENTIFIER") instanceof AssociationEnd);
    assert.strictEqual(association.findEnd("NOT_ROLE_IDENTIFIER"), undefined);
  });
});
