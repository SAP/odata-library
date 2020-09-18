"use strict";

const assert = require("assert");
const Metadata = require("../../../lib/model/Metadata");

const settings = {};

const functionImports = [
  {
    $: {
      Name: "C_AllocSenderValueKeyFieldTPPreparation1",
      ReturnType: "Namespace.ComplexType2",
      EntitySet: "EntitySet1",
      "m:HttpMethod": "POST",
      "sap:action-for": "Namespace.EntityType2",
      "sap:applicable-path": "Preparation_ac",
    },
    Parameter: [
      {
        $: {
          Name: "AllocationType",
          Type: "Edm.String",
          Mode: "In",
          MaxLength: "30",
        },
      },
      {
        $: {
          Name: "AllocationCycle",
          Type: "Edm.String",
          Mode: "In",
          MaxLength: "10",
        },
      },
      {
        $: {
          Name: "AllocationCycleStartDate",
          Type: "Edm.DateTime",
          Mode: "In",
          Precision: "0",
        },
      },
      {
        $: {
          Name: "AllocationCycleSegment",
          Type: "Edm.String",
          Mode: "In",
          MaxLength: "4",
        },
      },
      {
        $: {
          Name: "AllocDocumentSequenceNumber",
          Type: "Edm.String",
          Mode: "In",
          MaxLength: "4",
        },
      },
      {
        $: {
          Name: "DraftUUID",
          Type: "Edm.Guid",
          Mode: "In",
        },
      },
      {
        $: {
          Name: "IsActiveEntity",
          Type: "Edm.Boolean",
          Mode: "In",
        },
      },
      {
        $: {
          Name: "SideEffectsQualifier",
          Type: "Edm.String",
          Mode: "In",
          Nullable: "true",
        },
      },
    ],
  },
  {
    $: {
      Name: "C_AllocSenderValueKeyFieldTPPreparation2",
      ReturnType: "Namespace.ComplexType2",
      EntitySet: "EntitySet1",
      "m:HttpMethod": "POST",
      "sap:action-for": "Namespace.EntityType2",
      "sap:applicable-path": "Preparation_ac",
    },
  },
  {
    $: {
      Name: "C_AllocSenderValueKeyFieldTPPreparation3",
      ReturnType: "Namespace.ComplexType2",
      EntitySet: "EntitySet1",
      "sap:action-for": "Namespace.EntityType2",
      "sap:applicable-path": "Preparation_ac",
    },
  },
];

function createMDWithAnnotations(annotations) {
  let schema = {
    $: {
      Namespace: "Namespace",
    },
    EntityType: [
      {
        $: {
          Name: "EntityType1",
        },
        Key: [
          {
            PropertyRef: [
              {
                $: {
                  Name: "Field1",
                },
              },
            ],
          },
        ],
        Property: [
          {
            $: {
              Name: "Field1",
              Type: "Edm.String",
            },
          },
        ],
        NavigationProperty: [
          {
            $: {
              Name: "Navigation1",
            },
          },
          {
            $: {
              Name: "Parameters",
              Relationship: "Namespace.Relation1",
            },
          },
        ],
      },
      {
        $: {
          Name: "EntityType2",
        },
        Key: [
          {
            PropertyRef: [
              {
                $: {
                  Name: "P_Param1",
                },
              },
            ],
          },
        ],
        Property: [
          {
            $: {
              Name: "P_Param1",
              Type: "Edm.String",
            },
          },
        ],
      },
    ],
    ComplexType: [
      {
        $: {
          Name: "ComplexType1",
        },
        Property: [
          {
            $: {
              Name: "Field1",
              Type: "Edm.String",
            },
          },
        ],
      },
      {
        $: {
          Name: "ComplexType2",
        },
        Property: [
          {
            $: {
              Name: "Field1",
              Type: "Edm.String",
            },
          },
        ],
      },
    ],
    EntityContainer: [
      {
        $: {
          Name: "Namespace_Entities",
          "m:IsDefaultEntityContainer": "true",
        },
        EntitySet: [
          {
            $: {
              Name: "EntitySet1",
              EntityType: "Namespace.EntityType1",
            },
          },
          {
            $: {
              Name: "EntitySet2",
              EntityType: "Namespace.EntityType2",
            },
          },
        ],
        FunctionImport: functionImports,
      },
    ],
    Association: [
      {
        $: {
          Name: "Relation1",
        },
        End: [
          {
            $: {
              Type: "Namespace.EntityType1",
            },
          },
          {
            $: {
              Type: "Namespace.EntityType2",
            },
          },
        ],
      },
    ],
  };

  if (annotations) {
    schema.Annotations = annotations;
  }

  return {
    "edmx:Edmx": {
      $: {
        Version: "1.0",
      },
      "edmx:DataServices": [
        {
          Schema: [schema],
        },
      ],
    },
  };
}

function simpleAnnotation(target) {
  return [
    {
      $: {
        Target: target,
      },
      Annotation: [
        {
          $: {
            Term: "T1",
          },
        },
      ],
    },
  ];
}

describe("Metadata (aggregated functionality)", function () {
  describe("#getFunctionImport()", function () {
    [
      {
        description: "Return fully defined function",
        id: "C_AllocSenderValueKeyFieldTPPreparation1",
        result: {
          Name: "C_AllocSenderValueKeyFieldTPPreparation1",
          ReturnType: "Namespace.ComplexType2",
          HttpMethod: "POST",
          Parameter: [
            {
              MaxLength: 30,
              Mode: "In",
              Name: "AllocationType",
              Nullable: true,
              Precision: undefined,
              Scale: undefined,
              Type: "Edm.String",
            },
            {
              MaxLength: 10,
              Mode: "In",
              Name: "AllocationCycle",
              Nullable: true,
              Precision: undefined,
              Scale: undefined,
              Type: "Edm.String",
            },
            {
              MaxLength: undefined,
              Mode: "In",
              Name: "AllocationCycleStartDate",
              Nullable: true,
              Precision: 0,
              Scale: undefined,
              Type: "Edm.DateTime",
            },
            {
              MaxLength: 4,
              Mode: "In",
              Name: "AllocationCycleSegment",
              Nullable: true,
              Precision: undefined,
              Scale: undefined,
              Type: "Edm.String",
            },
            {
              MaxLength: 4,
              Mode: "In",
              Name: "AllocDocumentSequenceNumber",
              Nullable: true,
              Precision: undefined,
              Scale: undefined,
              Type: "Edm.String",
            },
            {
              MaxLength: undefined,
              Mode: "In",
              Name: "DraftUUID",
              Nullable: true,
              Precision: undefined,
              Scale: undefined,
              Type: "Edm.Guid",
            },
            {
              MaxLength: undefined,
              Mode: "In",
              Name: "IsActiveEntity",
              Nullable: true,
              Precision: undefined,
              Scale: undefined,
              Type: "Edm.Boolean",
            },
            {
              MaxLength: undefined,
              Mode: "In",
              Name: "SideEffectsQualifier",
              Nullable: true,
              Precision: undefined,
              Scale: undefined,
              Type: "Edm.String",
            },
          ],
        },
      },
      {
        description:
          "Return empty Parameter array if the paramter tag does not exists",
        id: "C_AllocSenderValueKeyFieldTPPreparation2",
        result: {
          Name: "C_AllocSenderValueKeyFieldTPPreparation2",
          ReturnType: "Namespace.ComplexType2",
          HttpMethod: "POST",
          Parameter: [],
        },
      },
      {
        description: "Use GET as default HttpMethod",
        id: "C_AllocSenderValueKeyFieldTPPreparation3",
        result: {
          Name: "C_AllocSenderValueKeyFieldTPPreparation3",
          ReturnType: "Namespace.ComplexType2",
          HttpMethod: "GET",
          Parameter: [],
        },
      },
    ].forEach((testCase) => {
      it(testCase.description, () => {
        let md = new Metadata([createMDWithAnnotations()], settings);
        let fi = md.getFunctionImport(testCase.id);
        assert.deepEqual(fi, testCase.result);
      });
    });
  });

  describe("#compileMetadata()", function () {
    it("Processes annotations for entity set", function () {
      let raw = [
        createMDWithAnnotations(
          simpleAnnotation("Namespace.Namespace_Entities/EntitySet1")
        ),
      ];
      let md = new Metadata(raw, settings);
      let container = md.model
        .getSchema()
        .getEntityContainer("Namespace_Entities");
      let entity1 = container.entitySets.find((e) => e.name === "EntitySet1");
      assert.equal(entity1.annotations.length, 1);
      let entity2 = container.entitySets.find((e) => e.name === "EntitySet2");
      assert.equal(entity2.annotations.length, 0);
    });

    it("Processes annotations for entity container", function () {
      ["Namespace.Namespace_Entities", "Namespace.Namespace_Entities/"].forEach(
        (target) => {
          let raw = [createMDWithAnnotations(simpleAnnotation(target))];
          let md = new Metadata(raw, settings);
          assert.equal(
            md.model.getSchema().getEntityContainer("Namespace_Entities")
              .annotations.length,
            1
          );
        }
      );
    });

    it("Processes annotations for entity type", function () {
      ["Namespace.EntityType1", "Namespace.EntityType1/"].forEach((target) => {
        let raw = [createMDWithAnnotations(simpleAnnotation(target))];
        let md = new Metadata(raw, settings);
        let entity1 = md.model.getSchema().getEntityType("EntityType1");
        assert.ok(!!entity1);
        assert.equal(entity1.annotations.length, 1);
        let entity2 = md.model.getSchema().getEntityType("EntityType2");
        assert.ok(!!entity2);
        assert.equal(entity2.annotations.length, 0);
      });
    });

    it("Processes annotations for entity field", function () {
      let raw = [
        createMDWithAnnotations(
          simpleAnnotation("Namespace.EntityType1/Field1")
        ),
      ];
      let md = new Metadata(raw, settings);
      let entity = md.model.getSchema().getEntityType("EntityType1");
      assert.ok(!!entity);
      let field = entity.getProperty("Field1");
      assert.ok(!!field);
      assert.equal(field.annotations.length, 1);
    });

    it("Processes annotations for entity navigation property", function () {
      let raw = [
        createMDWithAnnotations(
          simpleAnnotation("Namespace.EntityType1/Navigation1")
        ),
      ];
      let md = new Metadata(raw, settings);
      let entity = md.model.getSchema().getEntityType("EntityType1");
      assert.ok(!!entity);
      let field = entity.getNavigationProperty("Navigation1");
      assert.ok(!!field);
      assert.equal(field.annotations.length, 1);
    });

    it("Processes annotations for entity parameter", function () {
      let raw = [
        createMDWithAnnotations(
          simpleAnnotation("Namespace.EntityType1/P_Param1")
        ),
      ];
      let md = new Metadata(raw, settings);
      let entity = md.model.getSchema().getEntityType("EntityType2");
      assert.ok(!!entity);
      let field = entity.getProperty("P_Param1");
      assert.ok(!!field);
      assert.equal(field.annotations.length, 1);
    });

    it("Processes annotations for complex type", function () {
      ["Namespace.ComplexType1", "Namespace.ComplexType1/"].forEach(
        (target) => {
          let raw = [createMDWithAnnotations(simpleAnnotation(target))];
          let md = new Metadata(raw, settings);
          let type = md.model
            .getSchema()
            .complexTypes.find((t) => t.name === "ComplexType1");
          assert.ok(!!type);
          assert.equal(type.annotations.length, 1);
        }
      );
    });

    it("Processes annotations for complex type field", function () {
      let raw = [
        createMDWithAnnotations(
          simpleAnnotation("Namespace.ComplexType1/Field1")
        ),
      ];
      let md = new Metadata(raw, settings);
      let type = md.model
        .getSchema()
        .complexTypes.find((t) => t.name === "ComplexType1");
      assert.ok(!!type);
      let field = type.getProperty("Field1");
      assert.ok(!!field);
      assert.equal(field.annotations.length, 1);
    });

    it("Processes valid annotations and ignores malformed", function () {
      let raw = [
        createMDWithAnnotations(
          simpleAnnotation("Namespace.EntityType1").concat([""])
        ),
      ];
      let md = new Metadata(raw, settings);
      let entity = md.model.getSchema().getEntityType("EntityType1");
      assert.ok(!!entity);
      assert.equal(entity.annotations.length, 1);
    });

    it("Verifies annotation namespace", function () {
      let raw = [
        createMDWithAnnotations(simpleAnnotation("Missing.Something")),
      ];
      assert.throws(() => {
        let md = new Metadata(raw, settings);
        assert.ok(md);
      });
    });

    it("Throws error on invalid element annotation target", function () {
      let raw = [
        createMDWithAnnotations(simpleAnnotation("Namespace.Missing")),
      ];
      assert.throws(() => {
        let md = new Metadata(raw, settings);
        assert.ok(md);
      });
    });

    it("Throws error on invalid entity set annotation target", function () {
      let raw = [
        createMDWithAnnotations(
          simpleAnnotation("Namespace.EntitySet1/Missing")
        ),
      ];
      assert.throws(() => {
        let md = new Metadata(raw, settings);
        assert.ok(md);
      });
    });

    it("Throws error on invalid entity type annotation target", function () {
      let raw = [
        createMDWithAnnotations(
          simpleAnnotation("Namespace.EntityType1/Missing")
        ),
      ];
      assert.throws(() => {
        let md = new Metadata(raw, settings);
        assert.ok(md);
      });
    });

    it("Doesn't fail on no annotations", function () {
      let md = new Metadata([createMDWithAnnotations()], settings);
      assert.ok(md);
    });

    it("Throws error on invalid target ", function () {
      let raw = createMDWithAnnotations(simpleAnnotation(""));
      assert.throws(() => {
        let md = new Metadata(raw, settings);
        assert.ok(md);
      });
    });
  });
});
