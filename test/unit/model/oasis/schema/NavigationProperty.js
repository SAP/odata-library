"use strict";

const _ = require("lodash");
const assert = require("assert");
const CollectionType = require("../../../../../lib/model/oasis/schema/CollectionType");
const NavigationProperty = require("../../../../../lib/model/oasis/schema/NavigationProperty");

const sampleMD = {
  $: {
    ContainsTarget: "true",
    Name: "n",
    Partner: "p",
  },
  OnDelete: [
    {
      $: {
        Action: "Cascade",
      },
    },
  ],
  ReferentialConstraint: [
    {
      $: {
        Property: "prop1",
        ReferencedProperty: "prop2",
      },
    },
  ],
};

describe("NavigationProperty (oasis)", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let np = new NavigationProperty(sampleMD);
      assert.equal(np.containsTarget, true);
      assert.equal(np.name, "n");
      assert.equal(np.partner, "p");
      assert.ok(_.isArray(np.referentialConstraints));
      assert.equal(np.referentialConstraints.length, 1);
      assert.ok(_.has(np, "onDelete"));
    });

    it("uses property defaults", function () {
      let np = new NavigationProperty({
        $: {
          Name: "n",
        },
      });
      assert.equal(np.containsTarget, false);
      assert.equal(np.name, "n");
      assert.ok(!_.has(np, "partner"));
      assert.ok(!_.has(np, "onDelete"));
      assert.ok(_.isArray(np.referentialConstraints));
      assert.equal(np.referentialConstraints.length, 0);
    });

    it("throws error if name is missing", function () {
      assert.throws(
        () =>
          new NavigationProperty({
            $: {},
          })
      );
    });

    it("throws error if multiple On-Delete actions are present", function () {
      assert.throws(
        () =>
          new NavigationProperty({
            $: {
              Name: "n",
            },
            OnDelete: [
              {
                $: {
                  Action: "Cascade",
                },
              },
              {
                $: {
                  Action: "None",
                },
              },
            ],
          })
      );
    });
  });

  describe(".initSchemaDependentProperties()", function () {
    it("resolves type reference", function () {
      let np = new NavigationProperty({
        $: {
          Name: "n",
          Type: "t",
        },
      });

      let type = {};
      np.initSchemaDependentProperties({
        getType: () => type,
      });
      assert.equal(np.type, type);
      assert.equal(np.nullable, true);
      assert.ok(!np.isCollection);
    });

    it("checks Collection type", function () {
      let np = new NavigationProperty({
        $: {
          Name: "n",
          Type: "t",
        },
      });

      let type = new CollectionType({});
      np.initSchemaDependentProperties({
        getType: () => type,
      });

      assert.ok(!_.has(np, "nullable"));
      assert.ok(np.isCollection);
    });

    it("throws error if nullable is set for Collection type", function () {
      let np = new NavigationProperty({
        $: {
          Name: "n",
          Nullable: "true",
          Type: "t",
        },
      });

      let type = new CollectionType({});
      assert.throws(() =>
        np.initSchemaDependentProperties({
          getType: () => type,
        })
      );
    });
  });

  describe(".getTarget()", function () {
    it("gets navigation target w/ binding", function () {
      let np = new NavigationProperty(sampleMD);
      let type = {};
      let set = {};
      let schema = {
        getEntityContainer: () => ({
          resolveModelPath: () => set,
        }),
        getType: () => type,
      };

      let source = {
        navigationPropertyBindings: [
          {
            path: "n",
            target: "target",
          },
        ],
      };

      np.initSchemaDependentProperties(schema);

      let target = np.getTarget(schema, source);
      assert.equal(target.entitySet, set);
      assert.equal(target.entityType, type);
      assert.ok(!target.isMultiple);
    });

    it("gets navigation target w/o binding", function () {
      let np = new NavigationProperty(sampleMD);
      let type = {};
      let schema = {
        getType: () => type,
      };

      let source = {
        navigationPropertyBindings: [],
      };

      np.initSchemaDependentProperties(schema);

      let target = np.getTarget(schema, source);
      assert.equal(target.entitySet, undefined);
      assert.equal(target.entityType, type);
      assert.ok(!target.isMultiple);
    });
  });
});
