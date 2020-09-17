"use strict";

const assert = require("assert");
const sinon = require("sinon");
const AssociationSetEnd = require("../../../../../lib/model/nw/dataSource/AssociationSetEnd");
const sampleEndMD = {
  $: {
    EntitySet: "entitySet",
    Role: "sampleRole",
  },
};

describe("AssociationSetEnd", function () {
  describe("#constructor()", function () {
    it("initializes basic properties", function () {
      let entitySet = {};
      let schema = {
        getEntityContainer: sinon.stub().returns({
          getEntitySet: sinon.stub().returns(entitySet),
        }),
      };

      let associationEnd = {
        role: "sampleRole",
      };
      let association = {
        ends: [associationEnd],
      };

      let end = new AssociationSetEnd(sampleEndMD, schema, association);
      assert.equal(end.raw, sampleEndMD);
      assert.equal(end.entitySet, entitySet);
      assert.equal(end.role, "sampleRole");
      assert.equal(end.associationEnd, associationEnd);
    });

    it("throws error on invalid role", function () {
      let schema = {
        getEntityContainer: sinon.stub().returns({
          getEntitySet: sinon.stub(),
        }),
      };

      assert.throws(
        () =>
          new AssociationSetEnd(sampleEndMD, schema, {
            ends: [],
          })
      );
    });
  });
});
