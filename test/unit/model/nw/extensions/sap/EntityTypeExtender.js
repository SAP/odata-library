"use strict";

const assert = require("assert");

const EntityTypeExtender = require("../../../../../../lib/model/nw/extensions/sap/EntityTypeExtender");

function getEntityType() {
  return {
    annotations: [
      {
        term: "UI.SelectionFields",
        collection: ["Prop1"],
      },
      {
        term: "UI.LineItem",
        collection: [
          {
            type: "x",
          },
        ],
      },
    ],
    extensions: [],
    getProperty: (x) => ({
      name: x,
    }),
    navigationProperties: [
      {
        extensions: [],
        raw: {},
      },
    ],
    properties: [
      {
        raw: {
          $: {},
        },
        annotations: [],
        extensions: [],
      },
      {
        raw: {
          $: {
            "sap:label": "label",
            "sap:filterable": "false",
            "sap:sortable": "false",
          },
        },
        annotations: [
          {
            term: "Common.ValueList",
          },
        ],
        extensions: [],
      },
    ],
    raw: {},
  };
}

function sampleEntityType() {
  let entityType = getEntityType();
  EntityTypeExtender.process(entityType, {}, {});
  return entityType;
}

describe("EntityTypeExtender", function () {
  describe("process()", function () {
    it("applies sap schema extensions to entity type", function () {
      let entityType = sampleEntityType();
      assert.equal(entityType.sap.ui.selectionFields.length, 1);
      assert.equal(entityType.sap.ui.selectionFields[0].name, "Prop1");
      assert.equal(entityType.sap.ui.lineItems.length, 1);
      assert.equal(entityType.sap.ui.lineItems[0].type, "x");
      assert.ok(entityType.sap.hasOwnProperty("common"));
      assert.ok(entityType.sap.common.hasOwnProperty("sideEffects"));
    });

    it("applies sap schema extensions to properties (defaults and explicit values)", function () {
      let entityType = sampleEntityType();

      let prop1 = entityType.properties[0];
      assert.ok(prop1.sap);
      assert.equal(prop1.sap.valueLists.length, 0);
      assert.equal(prop1.sap.filterable, true);
      assert.equal(prop1.sap.sortable, true);

      let api1 = {};
      prop1.sap.extendLegacyApiObject(api1);
      assert.equal(api1.Filterable, true);
      assert.equal(api1.Sortable, true);

      let prop2 = entityType.properties[1];
      assert.ok(prop2.sap);
      assert.equal(prop2.sap.valueLists.length, 1);
      assert.equal(prop2.sap.filterable, false);
      assert.equal(prop2.sap.label, "label");
      assert.equal(prop2.sap.sortable, false);

      let api2 = {};
      prop2.sap.extendLegacyApiObject(api2);
      assert.equal(api2.Filterable, false);
      assert.equal(api2.Label, "label");
      assert.equal(api2.Sortable, false);
    });

    it("Creates Common.SideEffects instances", function () {
      let entityType = getEntityType();
      entityType.annotations.push({
        term: "Common.SideEffects",
      });

      EntityTypeExtender.process(entityType, {}, {});
      assert.strictEqual(entityType.sap.common.sideEffects.length, 1);
    });
  });
});
