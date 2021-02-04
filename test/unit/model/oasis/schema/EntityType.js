"use strict";

const _ = require("lodash");
const assert = require("assert").strict;
const EntityType = require("../../../../../lib/model/oasis/schema/EntityType");

const sampleEntityTypeMD = {
  $: {
    Name: "EntityType1",
  },
  Key: [
    {
      PropertyRef: [
        {
          $: {
            Name: "Prop1",
          },
        },
      ],
    },
  ],
  Property: [
    {
      $: {
        Name: "Prop1",
      },
    },
  ],
  NavigationProperty: [
    {
      $: {
        Name: "NavProp1",
      },
    },
    {
      $: {
        Name: "Parameters",
        Relationship: "ParamRelation",
      },
    },
  ],
};

const paramEntityTypeMD = {
  $: {
    Name: "EntityType2",
  },
  Key: [
    {
      PropertyRef: [
        {
          $: {
            Name: "Param1",
          },
        },
      ],
    },
  ],
  Property: [
    {
      $: {
        Name: "Param1",
        Type: "Edm.String",
      },
    },
  ],
};

function createSchema(type) {
  let paramType = new EntityType(paramEntityTypeMD);
  return {
    namespace: "ns",
    resolveModelPath: () => ({
      ends: [
        {
          type: type,
        },
        {
          type: paramType,
        },
      ],
    }),
    getType: (name) => (name === "ns.T1" ? type : paramType),
  };
}

describe("EntityType (oasis)", function () {
  let type;
  beforeEach(function () {
    type = new EntityType(sampleEntityTypeMD);
  });

  describe("#constructor()", function () {
    it("initializes properties", function () {
      assert.equal(type.raw, sampleEntityTypeMD);
      assert.equal(type.name, "EntityType1");
      assert.ok(_.isArray(type.properties));
      assert.ok(_.isArray(type.navigationProperties));
      assert.ok(_.isArray(type.key));
    });

    it("creates key", function () {
      let key = type.key;
      assert.ok(_.isArray(key));
      assert.equal(key.length, 1);
      assert.equal(key[0].name, "Prop1");
    });

    it("throws on invalid key definition", function () {
      assert.throws(
        () =>
          new EntityType({
            $: {
              Name: "EntityType1",
            },
            Key: [],
          }).key
      );
    });
  });

  describe(".getProperty()", function () {
    it("gets property by its name", function () {
      let prop = type.getProperty("Prop1");
      assert.ok(prop);
      assert.equal(prop.name, "Prop1");
    });
  });

  describe(".resolveModelPath()", function () {
    it("resolves itself", function () {
      assert.deepEqual(type.resolveModelPath(), type);
    });

    it("resolves properties", function () {
      assert.equal(type.resolveModelPath("Prop1").name, "Prop1");
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements annotations api", function () {
      let schema = createSchema(type);
      type.initSchemaDependentProperties(schema);
      let api = type.getLegacyApiObject();
      assert.equal(api.Name, "EntityType1");
      assert.ok(_.has(api, "Annotations"));
      assert.ok(_.has(api, "Properties"));
      assert.ok(_.isArray(api.Key));
    });
  });
});
