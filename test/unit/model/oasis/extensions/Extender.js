"use strict";

const _ = require("lodash");
const assert = require("assert");
const Extender = require("../../../../../lib/model/oasis/extensions/Extender");

describe("Extender (oasis)", function () {
  it("applies sap schema extensions to schema", function () {
    let schema = {
      entityContainers: [
        {
          entitySets: [{}],
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
  });
});
