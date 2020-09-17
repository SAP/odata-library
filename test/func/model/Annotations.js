"use strict";

const assert = require("assert");
const Metadata = require("../../../lib/model/Metadata");

const settings = {};

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
        NavigationProperty: [
          {
            $: {
              Name: "to_Something",
            },
          },
        ],
        Property: [
          {
            $: {
              Name: "Field1",
              Type: "Edm.String",
            },
          },
          {
            $: {
              Name: "Field2",
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

describe("Annotations' values", function () {
  it("handles nested record, collections and annotations", function () {
    let raw = [
      createMDWithAnnotations([
        {
          $: {
            Target: "Namespace.EntityType1",
          },
          Annotation: [
            {
              $: {
                Term: "T1",
              },
              Annotation: [
                {
                  $: {
                    Term: "T2",
                  },
                },
              ],
              Record: [
                {
                  Annotation: [
                    {
                      $: {
                        Term: "T3",
                      },
                    },
                  ],
                  PropertyValue: [
                    {
                      $: {
                        Property: "SortOrder",
                      },
                      Collection: [
                        {
                          Record: [
                            {
                              PropertyValue: [
                                {
                                  $: {
                                    Property: "Property",
                                    PropertyPath: "SomeDate",
                                  },
                                  Annotation: [
                                    {
                                      $: {
                                        Term: "T4",
                                      },
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              $: {
                Term: "Common.SideEffects",
                Qualifier: "header",
              },
              Record: [
                {
                  PropertyValue: [
                    {
                      $: {
                        Property: "SourceProperties",
                      },
                      Collection: [
                        {
                          PropertyPath: ["Field1"],
                        },
                      ],
                    },
                    {
                      $: {
                        Property: "TargetEntities",
                      },
                      Collection: [
                        {
                          NavigationPropertyPath: ["to_Something"],
                        },
                      ],
                    },
                    {
                      $: {
                        Property: ["TargetProperties"],
                      },
                      Collection: [
                        {
                          PropertyPath: ["Field2"],
                        },
                      ],
                    },
                    {
                      $: {
                        Property: "EffectTypes",
                        EnumMember: "ValueChange ValidationMessage",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]),
    ];

    let md = new Metadata(raw, settings);
    let annotation = md.model.getSchema().entityTypes[0].annotations[0];
    assert.equal(annotation.term, "T1");
    assert.equal(annotation.annotations[0].term, "T2");
    assert.equal(annotation.record.annotations[0].term, "T3");

    let propValue1 = annotation.record.propertyValues[0];
    assert.equal(propValue1, annotation.record.value.SortOrder);
    assert.equal(propValue1.property, "SortOrder");
    assert.equal(propValue1.collection.length, 1);

    let propValue2 = propValue1.collection[0].propertyValues[0];
    assert.equal(propValue2, propValue1.collection[0].value.Property);
    assert.equal(propValue2.property, "Property");
    assert.equal(propValue2.propertyPath, "SomeDate");
    assert.equal(propValue2.annotations[0].term, "T4");
  });
});
