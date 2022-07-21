"use strict";

const _ = require("lodash");
const assert = require("assert").strict;
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

let prop;
let model;
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
  beforeEach(() => {
    model = {
      resolveModelPath: sinon.stub(),
    };
    prop = new NavigationProperty(sampleNavigationPropertyMD, model);
  });
  describe("#constructor()", function () {
    it("initializes properties", function () {
      assert.equal(prop.raw, sampleNavigationPropertyMD);
      assert.equal(prop.name, "navigationProperty");
      assert.equal(prop.relationship, "ns.relationship");
      assert.equal(prop.fromRole, "fromRole");
      assert.equal(prop.toRole, "toRole");
    });
    it("invalid association", () => {
      "ns.relationship";
      assert.throws(() => prop.association);
    });
    it("correct association", () => {
      model.resolveModelPath.returns("ASSOCIATION");
      assert.equal(prop.association, "ASSOCIATION");
      assert.ok(model.resolveModelPath.calledWithExactly("ns.relationship"));
    });
    it("correct association", () => {
      model.resolveModelPath.returns("ASSOCIATION");
      assert.equal(prop.association, "ASSOCIATION");
      assert.ok(model.resolveModelPath.calledWithExactly("ns.relationship"));
    });
    it("missing associationEnd", () => {
      let association = {
        findEnd: sinon.stub(),
      };
      model.resolveModelPath.returns(association);
      assert.throws(() => prop.associationEnd);
    });
    it("correct associationEnd", () => {
      let association = {
        findEnd: sinon.stub().returns("ASSOCIATION_END"),
      };
      model.resolveModelPath.returns(association);
      assert.equal(prop.associationEnd, "ASSOCIATION_END");
      assert.ok(association.findEnd.calledWithExactly("toRole"));
    });
    it("type", () => {
      let associationEnd = {
        type: "TYPE",
      };
      let association = {
        findEnd: sinon.stub().returns(associationEnd),
      };
      model.resolveModelPath.returns(association);
      assert.deepEqual(prop.type, {
        elementType: "TYPE",
      });
    });
    it("type", () => {
      let associationEnd = {
        multiplicity: "1",
      };
      let association = {
        findEnd: sinon.stub().returns(associationEnd),
      };
      model.resolveModelPath.returns(association);
      assert.equal(prop.isCollection, false);
      associationEnd.multiplicity = "*";
      assert.equal(prop.isCollection, true);
    });
  });

  describe(".getTarget()", function () {
    it("gets navigation association set", function () {
      let target = prop.getTarget(sampleSchema);
      assert.equal(target.entitySet, sampleTargetSet);
    });

    it("throws error on invalid association name", function () {
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
