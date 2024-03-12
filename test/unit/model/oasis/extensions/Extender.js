"use strict";

const _ = require("lodash");
const assert = require("assert");
const Extender = require("../../../../../lib/model/oasis/extensions/Extender");

describe("Extender (oasis)", function () {
  it("applies sap schema extensions to schema", function () {
    let schema = {
      entityContainers: [
        {
          entitySets: [
            {
              annotations: [],
            },
            {
              annotations: [
                {
                  term: "SAP__capabilities.SearchRestrictions",
                  record: {
                    value: {
                      Searchable: {
                        bool: "false",
                      },
                    },
                  },
                },
              ],
            },
            {
              annotations: [
                {
                  term: "SAP__capabilities.SearchRestrictions",
                  record: {
                    value: {
                      Searchable: {
                        bool: "true",
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
      entityTypes: [
        {
          properties: [{}],
        },
      ],
    };

    Extender.apply(schema, {
      strict: true,
    });

    assert.ok(_.has(schema.entityTypes[0], "sap"));
    assert.ok(_.has(schema.entityTypes[0].properties[0], "sap"));
    assert.ok(schema.entityTypes[0].properties[0].sap.sortable);
    assert.ok(_.has(schema.entityContainers[0].entitySets[0], "sap"));
    assert.ok(schema.entityContainers[0].entitySets[0].sap.pageable);
    assert.ok(schema.entityContainers[0].entitySets[0].sap.searchable);
    assert.ok(!schema.entityContainers[0].entitySets[1].sap.searchable);
    assert.ok(schema.entityContainers[0].entitySets[2].sap.searchable);
  });
});
