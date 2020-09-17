"use strict";

const _ = require("lodash");
const assert = require("assert");
const Metadata = require("../../../lib/model/Metadata");

const settings = {};

describe("Metadata", function () {
  let rawMetadata;
  let metadata;

  beforeEach(function () {
    rawMetadata = [
      {
        "edmx:Edmx": {
          $: {
            Version: "1.0",
          },
          "edmx:DataServices": [
            {
              Schema: [
                {
                  $: {
                    Namespace: "ns",
                  },
                  Association: [
                    {
                      $: {
                        Name: "Association1",
                      },
                      End: [
                        {
                          $: {},
                        },
                        {
                          $: {},
                        },
                      ],
                    },
                  ],
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
                    },
                  ],
                  EntityContainer: [
                    {
                      $: {
                        Name: "Container",
                        "m:IsDefaultEntityContainer": "true",
                      },
                      FunctionImport: [
                        {
                          $: {
                            Name: "FunctionImport1",
                            ReturnType: "Edm.String",
                          },
                        },
                      ],
                      EntitySet: [
                        {
                          $: {
                            Name: "EntitySet1",
                            EntityType: "ns.EntityType1",
                          },
                        },
                      ],
                      AssociationSet: [
                        {
                          $: {
                            Name: "AssociationSet1",
                            Association: "ns.Association1",
                          },
                          End: [
                            {
                              $: {
                                EntitySet: "EntitySet1",
                              },
                            },
                            {
                              $: {
                                EntitySet: "EntitySet1",
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
      },
      {
        "edmx:Edmx": {
          $: {
            Version: "1.0",
          },
          "edmx:DataServices": [
            {
              Schema: [
                {
                  $: {
                    Namespace: "ns2",
                  },
                },
              ],
            },
          ],
        },
      },
    ];

    metadata = new Metadata(rawMetadata, settings);
  });

  describe("#constructor()", function () {
    it("Properties are initialized", function () {
      assert.strictEqual(metadata.raw, rawMetadata);
      assert.strictEqual(metadata.raw, rawMetadata);
      assert.ok(metadata.model);
      assert.equal(metadata.model.getSchema().settings, settings);
    });
  });

  describe(".listEntitySetNames()", function () {
    it("Get list of EntitySet names from metadata structures", function () {
      assert.deepEqual(metadata.listEntitySetNames(), ["EntitySet1"]);
      assert.deepEqual(metadata.listEntitySetNames("ns"), ["EntitySet1"]);
    });
  });

  describe(".listFunctionImportNames()", function () {
    it("Get list of FunctionImport names from metadata structure", function () {
      assert.deepEqual(metadata.listFunctionImportNames(), ["FunctionImport1"]);
      assert.deepEqual(metadata.listFunctionImportNames("ns"), [
        "FunctionImport1",
      ]);
    });
  });

  describe(".getEntitySet()", function () {
    it("Get EntitySet from metadata structures", function () {
      let res = metadata.getEntitySet("ns", "EntitySet1");
      assert.equal(res.Name, "EntitySet1");
      assert.equal(res.EntityType, "EntityType1");

      res = metadata.getEntitySet("EntitySet1");
      assert.equal(res.Name, "EntitySet1");
      assert.equal(res.EntityType, "EntityType1");

      assert.throws(() => {
        metadata.getFunctionImport("NotEntitySet");
      });
    });
  });

  describe(".getFunctionImport()", function () {
    it("Not implemented", function () {
      assert.throws(() => {
        metadata.getFunctionImport();
      });
    });
    it("Get FunctionImport from metadata structure", function () {
      let functionImport = {
        HttpMethod: "GET",
        Name: "FunctionImport1",
        Parameter: [],
        ReturnType: "Edm.String",
      };
      assert.deepEqual(
        metadata.getFunctionImport("ns", "FunctionImport1"),
        functionImport
      );
      assert.deepEqual(
        metadata.getFunctionImport("FunctionImport1"),
        functionImport
      );
      assert.throws(() => {
        metadata.getFunctionImport();
      });
    });
  });

  it(".getEntityType()", function () {
    let type = metadata.getEntityType("EntityType1");
    assert.equal(type.Name, "EntityType1");
    assert.ok(_.has(type, "Properties"));
    assert.ok(_.has(type, "NavigationProperties"));
    assert.ok(_.has(type, "Key"));
  });
});
