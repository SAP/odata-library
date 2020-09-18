"use strict";

const assert = require("assert");

const EntityContainerExtender = require("../../../../../../lib/model/nw/extensions/sap/EntityContainerExtender");

function sampleContainer() {
  return {
    associationSets: [],
    entitySets: [
      {
        annotations: [],
        extensions: [],
        navigationProperties: [],
        properties: [],
        raw: {},
      },
      {
        annotations: [],
        extensions: [],
        navigationProperties: [],
        properties: [],
        raw: {
          $: {
            "sap:addressable": "false",
            "sap:change-tracking": "true",
            "sap:countable": "false",
            "sap:creatable": "false",
            "sap:deletable": "false",
            "sap:deletable-path": "path",
            "sap:delta-link-validity": "validity",
            "sap:label": "label",
            "sap:maxpagesize": "size",
            "sap:pageable": "false",
            "sap:requires-filter": "true",
            "sap:searchable": "true",
            "sap:semantics": "aggregate",
            "sap:topable": "false",
            "sap:updatable": "false",
            "sap:updatable-path": "path",
          },
        },
      },
    ],
    extensions: [],
    functionImports: [
      {
        extensions: [],
        parameters: [
          {
            extensions: [],
            raw: {
              $: {},
            },
          },
        ],
        raw: {
          $: {},
        },
      },
    ],
    raw: {},
  };
}

function assertNonDefaultEntitySetApi(set) {
  let api = {};
  set.sap.extendLegacyApiObject(api);

  assert.strictEqual(api.Addressable, false);
  assert.strictEqual(api.ChangeTracking, true);
  assert.strictEqual(api.Countable, false);
  assert.strictEqual(api.Creatable, false);
  assert.strictEqual(api.Deletable, false);
  assert.strictEqual(api.DeletablePath, "path");
  assert.strictEqual(api.DeltaLinkValidity, "validity");
  assert.strictEqual(api.Label, "label");
  assert.strictEqual(api.Maxpagesize, "size");
  assert.strictEqual(api.Pageable, false);
  assert.strictEqual(api.RequiresFilter, true);
  assert.strictEqual(api.Searchable, true);
  assert.strictEqual(api.Semantics, "aggregate");
  assert.strictEqual(api.Topable, false);
  assert.strictEqual(api.Updatable, false);
  assert.strictEqual(api.UpdatablePath, "path");
}

describe("EntityContainerExtender", function () {
  describe("process()", function () {
    it("applies sap schema extensions to entity sets (defaults)", function () {
      let container = sampleContainer();
      EntityContainerExtender.process(container);

      let set = container.entitySets[0];
      assert.strictEqual(set.sap.addressable, true);
      assert.strictEqual(set.sap.changeTracking, false);
      assert.strictEqual(set.sap.countable, true);
      assert.strictEqual(set.sap.creatable, true);
      assert.strictEqual(set.sap.deletable, true);
      assert.strictEqual(set.sap.pageable, true);
      assert.strictEqual(set.sap.requiresFilter, false);
      assert.strictEqual(set.sap.searchable, false);
      assert.strictEqual(set.sap.topable, true);
      assert.strictEqual(set.sap.updatable, true);

      let api = {};
      set.sap.extendLegacyApiObject(api);
      assert.strictEqual(api.Addressable, true);
      assert.strictEqual(api.ChangeTracking, false);
      assert.strictEqual(api.Countable, true);
      assert.strictEqual(api.Creatable, true);
      assert.strictEqual(api.Deletable, true);
      assert.strictEqual(api.Pageable, true);
      assert.strictEqual(api.RequiresFilter, false);
      assert.strictEqual(api.Searchable, false);
      assert.strictEqual(api.Topable, true);
      assert.strictEqual(api.Updatable, true);
    });

    it("applies sap schema extensions to entity sets (explicit values)", function () {
      let container = sampleContainer();
      EntityContainerExtender.process(container);

      let set = container.entitySets[1];
      assert.strictEqual(set.sap.addressable, false);
      assert.strictEqual(set.sap.changeTracking, true);
      assert.strictEqual(set.sap.countable, false);
      assert.strictEqual(set.sap.creatable, false);
      assert.strictEqual(set.sap.deletable, false);
      assert.strictEqual(set.sap.deletablePath, "path");
      assert.strictEqual(set.sap.deltaLinkValidity, "validity");
      assert.strictEqual(set.sap.label, "label");
      assert.strictEqual(set.sap.maxpagesize, "size");
      assert.strictEqual(set.sap.pageable, false);
      assert.strictEqual(set.sap.requiresFilter, true);
      assert.strictEqual(set.sap.searchable, true);
      assert.strictEqual(set.sap.semantics, "aggregate");
      assert.strictEqual(set.sap.topable, false);
      assert.strictEqual(set.sap.updatable, false);
      assert.strictEqual(set.sap.updatablePath, "path");

      assertNonDefaultEntitySetApi(set);
    });
  });
});
