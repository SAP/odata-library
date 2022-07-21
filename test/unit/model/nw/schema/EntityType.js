"use strict";

const _ = require("lodash");
const assert = require("assert").strict;
const EntityType = require("../../../../../lib/model/nw/schema/EntityType");

const sampleEntityTypeMD = {
  $: {
    Name: "EntityType1",
    "m:HasStream": "true",
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

describe("EntityType (nw)", function () {
  let type;
  let model;

  beforeEach(function () {
    model = {};
    type = new EntityType(sampleEntityTypeMD, model);
  });

  describe("#constructor()", function () {
    it("initializes properties", function () {
      assert.equal(type.raw, sampleEntityTypeMD);
      assert.equal(type.name, "EntityType1");
      assert.ok(_.isArray(type.properties));
      assert.equal(
        sampleEntityTypeMD.NavigationProperty.length,
        type.navigationProperties.length
      );
      assert.equal(type.navigationProperties[0].model, model);
      assert.ok(_.isArray(type.key));
      assert.equal(type.model, model);
    });

    it("creates key", function () {
      let key = type.key;
      assert.ok(_.isArray(key));
      assert.equal(key.length, 1);
      assert.equal(key[0].name, "Prop1");
    });

    it("hasStream property", function () {
      assert.equal(type.hasStream, true);
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

  describe(".getNavigationProperty()", function () {
    it("gets navigation property by its name", function () {
      let prop = type.getNavigationProperty("NavProp1");
      assert.ok(prop);
      assert.equal(prop.name, "NavProp1");
    });

    it("throw error when navigation property is not available", function () {
      assert.throws(() => type.getNavigationProperty("notNavProp"));
    });
  });

  describe(".getParameter()", function () {
    it("gets parameter by its name", function () {
      let schema = createSchema(type);
      let prop = type.getParameter("Param1", schema);
      assert.ok(prop);
      assert.equal(prop.name, "Param1");
    });
  });

  describe(".resolveModelPath()", function () {
    it("resolves itself", function () {
      assert.deepEqual(type.resolveModelPath(), type);
    });

    it("resolves properties", function () {
      assert.equal(type.resolveModelPath("Prop1").name, "Prop1");
    });

    it("resolves navigation properties", function () {
      assert.equal(type.resolveModelPath("NavProp1").name, "NavProp1");
    });

    it("resolves parameters", function () {
      let schema = createSchema(type);
      type.initSchemaDependentProperties(schema);
      assert.equal(type.resolveModelPath("Param1", schema).name, "Param1");
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
      assert.ok(_.has(api, "NavigationProperties"));
      assert.equal(api.NavigationProperties.NavProp1.Name, "NavProp1");
      assert.ok(_.isArray(api.Key));
    });
  });
});
