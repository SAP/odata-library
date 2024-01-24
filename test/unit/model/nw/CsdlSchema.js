"use strict";

const _ = require("lodash");
const assert = require("assert");
const sinon = require("sinon");
const CsdlSchema = require("../../../../lib/model/nw/CsdlSchema");

const settings = {
  strict: true,
};

const emptySchemaMD = {
  $: {
    Namespace: "ns",
  },
};

const sampleSchemaMD = {
  $: {
    Namespace: "ns.a",
  },
  EntityType: [
    {
      $: {
        Name: "EntityType1",
      },
      Key: [
        {
          PropertyRef: [],
        },
      ],
    },
  ],
  ComplexType: [
    {
      $: {
        Name: "ComplexType1",
      },
    },
  ],
  EntityContainer: [
    {
      $: {
        Name: "EntityContainer",
        "m:IsDefaultEntityContainer": "true",
      },
      EntitySet: [
        {
          $: {
            Name: "EntitySet1",
            EntityType: "ns.a.EntityType1",
          },
        },
        {
          $: {
            Name: "EntitySet2",
            EntityType: "ns.a.EntityType1",
          },
        },
      ],
    },
  ],
  Annotations: [
    {
      $: {
        Target: "ns.a.EntityContainer/EntitySet2",
      },
      Annotation: [
        {
          $: {
            Term: "t1",
          },
        },
      ],
    },
  ],
};

describe("CsdlSchema", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let schema = new CsdlSchema(emptySchemaMD, settings, "MODEL");
      assert.strictEqual(schema.raw, emptySchemaMD);
      assert.deepEqual(schema.namespace, "ns");
      assert.equal(schema.settings, settings);
      assert.ok(_.isArray(schema.actions));
      assert.ok(_.isArray(schema.associations));
      assert.ok(_.isArray(schema.complexTypes));
      assert.ok(_.isArray(schema.entityTypes));
      assert.ok(_.isArray(schema.entityContainers));
      assert.ok(_.isArray(schema.extensions));
      assert.strictEqual(schema.model, "MODEL");
    });

    it("applies annotations", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.ok(
        schema.resolveModelPath("ns.a.EntityContainer/EntitySet2").hasTerm("t1")
      );
    });
  });

  describe(".getEntityType()", function () {
    it("finds entity type", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.ok(schema.getEntityType("EntityType1"));
    });

    it("throw error when type is not available", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.throws(() => schema.getEntityType("EntityTypeN"));
    });
  });

  describe(".getEntityContainer()", function () {
    it("finds entity container", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.ok(schema.getEntityContainer("EntityContainer"));
      assert.ok(schema.getEntityContainer());
    });
  });

  describe(".getType()", function () {
    it("finds entity type", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.ok(schema.getType("ns.a.EntityType1"));
    });

    it("finds complex type", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.ok(schema.getType("ns.a.ComplexType1"));
    });

    it("finds simple Edm type", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.ok(schema.getType("Edm.String"));
    });

    it("supports collection types", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.ok(schema.getType("Collection(Edm.String)"));
    });

    it("throw error when type is not available", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.throws(() => schema.getType("different.EntityType1"));
    });
  });

  describe(".resolveModelPath()", function () {
    it("throws on missing subelement", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      schema.resolveModelPath("ns.a.EntityType1");
      assert.throws(() => schema.resolveModelPath("ns.a.EntityType1/XX"));
    });

    it("throws on invalid schema", function () {
      let schema = new CsdlSchema(
        {
          $: {
            Namespace: "ns",
          },
          EntityType: [
            {
              $: {
                Name: "Type1",
              },
              Key: [
                {
                  PropertyRef: [],
                },
              ],
            },
          ],
          ComplexType: [
            {
              $: {
                Name: "Type1",
              },
            },
          ],
        },
        settings
      );

      assert.throws(() => schema.resolveModelPath("ns.Type1"));
    });
  });

  describe(".applyAnnotations()", function () {
    it("applies external target annotations to schema elements", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      let anno = {
        $: {
          Term: "T1",
        },
      };
      schema.applyAnnotations([
        {
          $: {
            Target: "ns.a.EntityContainer/EntitySet1",
          },
          Annotation: [anno],
        },
      ]);
      assert.ok(
        schema
          .getEntityContainer("EntityContainer")
          .entitySets[0].annotations.map((a) => a.raw)
          .includes(anno)
      );
    });

    it("throws on invalid namespace", function () {
      assert.throws(() => {
        let schema = new CsdlSchema(sampleSchemaMD, settings);
        schema.applyAnnotations([
          {
            $: {
              Target: "nowhere.something",
            },
          },
        ]);
      });
    });

    it("throws on invalid target", function () {
      assert.throws(() => {
        let schema = new CsdlSchema(sampleSchemaMD, settings);
        schema.applyAnnotations([
          {
            $: {
              Target: "blah",
            },
          },
        ]);
      });
    });

    it("throws on missing target", function () {
      assert.throws(() => {
        let schema = new CsdlSchema(sampleSchemaMD, settings);
        schema.applyAnnotations([
          {
            $: {
              Target: "ns.a.something",
            },
          },
        ]);
      });
    });

    it("doesn't throw on missing target, if not strict", function () {
      let easySettings = {
        strict: false,
        logger: {
          warn: sinon.stub(),
        },
      };

      let schema = new CsdlSchema(sampleSchemaMD, easySettings);
      schema.applyAnnotations([
        {
          $: {
            Target: "ns.a.something",
          },
        },
      ]);

      assert.ok(easySettings.logger.warn.called);
    });

    it("ignores invalid annotations", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      schema.applyAnnotations([undefined]);
    });

    it("ignores annotations only schemas", function () {
      let schema = new CsdlSchema(emptySchemaMD, settings);
      schema.applyAnnotations([
        {
          $: {
            Target: "something",
          },
        },
      ]);
    });

    it("rethrows annotations error", function () {
      let schema = new CsdlSchema(sampleSchemaMD, settings);
      assert.throws(() => {
        schema.applyAnnotations([
          {
            $: {
              Target: "ns.a.EntityType1",
            },
            Annotation: [{}],
          },
        ]);
      });
    });
  });
});
