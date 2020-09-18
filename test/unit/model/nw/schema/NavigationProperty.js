"use strict";

const _ = require("lodash");
const assert = require("assert");
const sinon = require("sinon");
const NavigationProperty = require("../../../../../lib/model/nw/schema/NavigationProperty");
const sampleNavigationPropertyMD = {
  $: {
    Name: "navigationProperty",
    Relationship: "ns.relationship",
    FromRole: "fromRole",
    ToRole: "toRole",
  },
};

let sampleTargetSet = {};
const sampleSchema = {
  namespace: "ns",
  getEntityContainer: sinon.stub().returns({
    associationSets: [
      {
        association: {
          name: "relationship",
        },
        ends: [
          {
            associationEnd: {},
            role: "fromRole",
          },
          {
            associationEnd: {},
            role: "toRole",
            entitySet: sampleTargetSet,
          },
        ],
      },
    ],
  }),
};

describe("NavigationProperty (nw)", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let prop = new NavigationProperty(sampleNavigationPropertyMD);

      assert.equal(prop.raw, sampleNavigationPropertyMD);
      assert.equal(prop.name, "navigationProperty");
      assert.equal(prop.relationship, "ns.relationship");
      assert.equal(prop.fromRole, "fromRole");
      assert.equal(prop.toRole, "toRole");
    });
  });

  describe(".getTarget()", function () {
    it("gets navigation association set", function () {
      let prop = new NavigationProperty(sampleNavigationPropertyMD);
      let target = prop.getTarget(sampleSchema);
      assert.equal(target.entitySet, sampleTargetSet);
    });

    it("throws error on invalid association name", function () {
      let prop = new NavigationProperty(sampleNavigationPropertyMD);
      assert.throws(() =>
        prop.getTarget({
          namespace: "ns",
          getEntityContainer: sinon.stub().returns({
            associationSets: [
              {
                association: {
                  name: "norelationship",
                },
              },
            ],
          }),
        })
      );
    });

    it("throws error on invalid 'to' role", function () {
      let prop = new NavigationProperty(sampleNavigationPropertyMD);
      assert.throws(() =>
        prop.getTarget({
          namespace: "ns",
          getEntityContainer: sinon.stub().returns({
            associationSets: [
              {
                association: {
                  name: "relationship",
                },
                ends: [
                  {
                    role: "fromRole",
                  },
                  {
                    role: "noRole",
                  },
                ],
              },
            ],
          }),
        })
      );
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements annotations api", function () {
      let api = new NavigationProperty(
        sampleNavigationPropertyMD
      ).getLegacyApiObject();
      assert.equal(api.Name, "navigationProperty");
      assert.ok(_.has(api, "Annotations"));
      assert.equal(api.Relationship, "ns.relationship");
      assert.equal(api.FromRole, "fromRole");
      assert.equal(api.ToRole, "toRole");
      assert.equal(api.getTarget(sampleSchema).entitySet, sampleTargetSet);
    });
  });
});
