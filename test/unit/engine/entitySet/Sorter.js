"use strict";

const assert = require("assert");
const sinon = require("sinon");
const _ = require("lodash");
const Sorter = require("../../../../lib/engine/entitySet/Sorter");

describe("Sorter", function () {
  it("#constructor()", function () {
    let sorter;
    sinon.stub(Sorter.prototype, "validate");

    sorter = new Sorter("TYPE", "SORTER");
    assert.ok(_.has(sorter, "parts"));
    assert.ok(Sorter.prototype.validate.calledWith("TYPE", "SORTER"));

    Sorter.prototype.validate.restore();
  });

  describe(".validate()", function () {
    let properties = [
      {
        name: "P1",
        sap: {
          sortable: true,
        },
      },
      {
        name: "P2",
        sap: {
          sortable: false,
        },
      },
      {
        name: "P3",
        sap: {
          sortable: true,
        },
      },
    ];
    let entityType = {
      name: "ENTITY_TYPE",
      getProperty: (name) => {
        let prop = properties.find((p) => p.name === name);
        if (!prop) {
          throw new Error();
        }
        return prop;
      },
      properties: properties,
    };
    it("Fails on non-existing property", function () {
      assert.throws(() => new Sorter(entityType, ["P1", "P4"]));
    });
    it("Fails on non-sortable property", function () {
      assert.throws(() => new Sorter(entityType, ["P1", "P2 asc"]), {
        message:
          "Property P2 cannot be used in orderby clause as it is not sortable",
      });
    });
    it("Validates without any error", function () {
      assert.doesNotThrow(() => new Sorter(entityType, ["P1", "P3 desc"]));
    });
  });

  it(".toURIComponent()", function () {
    let properties = [
      {
        name: "P1",
        sap: {
          sortable: true,
        },
      },
      {
        name: "P2",
        sap: {
          sortable: false,
        },
      },
      {
        name: "P3",
        sap: {
          sortable: true,
        },
      },
    ];

    let entityType = {
      name: "ENTITY_TYPE",
      getProperty: (name) => properties.find((p) => p.name === name),
      properties: properties,
    };

    assert.strictEqual(new Sorter(entityType, ["P1"]).toURIComponent(), "P1");
    assert.strictEqual(
      new Sorter(entityType, ["P1", "P3"]).toURIComponent(),
      "P1%2CP3"
    );
    assert.strictEqual(
      new Sorter(entityType, ["P1 desc"]).toURIComponent(),
      "P1%20desc"
    );
    assert.strictEqual(
      new Sorter(entityType, ["P1 desc"]).toURIComponent(),
      "P1%20desc"
    );
    assert.strictEqual(
      new Sorter(entityType, ["P1", "P2/P4"]).toURIComponent(),
      "P1%2CP2%2FP4"
    );
    assert.strictEqual(
      new Sorter(entityType, ["P1", "P3 asc"]).toURIComponent(),
      "P1%2CP3%20asc"
    );
  });
});
