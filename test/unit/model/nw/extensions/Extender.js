"use strict";

const assert = require("assert");
const sinon = require("sinon");

const processType = sinon.stub();
const processContainer = sinon.stub();

const proxyquire = require("proxyquire");
let Extender;

describe("Extender (nw)", function () {
  beforeEach(function () {
    Extender = proxyquire("../../../../../lib/model/nw/extensions/Extender", {
      "./sap/EntityTypeExtender": {
        process: processType,
      },
      "./sap/EntityContainerExtender": {
        process: processContainer,
      },
    });
  });

  it("applies sap schema extensions to schema (default, explicit)", function () {
    let schema = {
      entityContainers: [],
      entityTypes: [],
      extensions: [],
      raw: {},
    };

    Extender.apply(schema, {
      strict: true,
    });

    assert.equal(schema.sap.schemaVersion, "0000");
  });

  it("applies sap schema extensions to schema (explicit)", function () {
    let schema = {
      entityContainers: [{}],
      entityTypes: [{}],
      extensions: [],
      raw: {
        $: {
          "sap:schema-version": "1",
        },
      },
    };

    Extender.apply(schema, {
      strict: true,
    });

    assert.equal(schema.sap.schemaVersion, "1");
    assert.ok(processType.called);
    assert.ok(processContainer.called);
  });
});
