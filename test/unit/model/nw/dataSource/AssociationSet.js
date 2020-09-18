"use strict";

const assert = require("assert");
const _ = require("lodash");
const sinon = require("sinon");
const AssociationSet = require("../../../../../lib/model/nw/dataSource/AssociationSet");
const sampleAssocMD = {
  $: {
    Name: "name",
    Association: "association",
  },
  End: [
    {
      $: {
        EntitySet: "entitySet",
        Role: "fromRole",
      },
    },
    {
      $: {
        EntitySet: "entitySet",
        Role: "toRole",
      },
    },
  ],
};

const association = {
  name: "association",
  ends: [
    {
      role: "fromRole",
    },
    {
      role: "toRole",
    },
  ],
};

function getSampleSchema() {
  return {
    getEntityContainer: sinon.stub().returns({
      getEntitySet: sinon.stub().returns({}),
    }),
    resolveModelPath: sinon.stub().returns(association),
  };
}

describe("AssociationSet", function () {
  describe("#constructor()", function () {
    it("initializes basic properties", function () {
      let set = new AssociationSet(sampleAssocMD, getSampleSchema());
      assert.equal(set.raw, sampleAssocMD);
      assert.equal(set.name, "name");
      assert.equal(set.association, association);
      assert.equal(set.ends.length, 2);
      assert.ok(_.isArray(set.extensions));
    });

    it("throws error on invalid ends count", function () {
      assert.throws(
        () =>
          new AssociationSet(
            {
              $: {
                Name: "name",
                Association: "association",
              },
              End: [],
            },
            getSampleSchema()
          )
      );
    });
  });

  describe(".getEndByRole()", function () {
    it("finds end by role", function () {
      let set = new AssociationSet(sampleAssocMD, getSampleSchema());
      let end = set.getEndByRole("toRole");
      assert.equal(end.role, "toRole");
    });

    it("throws error, if end is missing", function () {
      let set = new AssociationSet(sampleAssocMD, getSampleSchema());

      assert.throws(() => set.getEndByRole("noRole"));
    });
  });
});
