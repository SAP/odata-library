"use strict";

const assert = require("assert");
const DataField = require("../../../../../../../lib/model/nw/extensions/sap/ui/DataField");

describe("DataField", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let record = {
        type: "x",
      };
      let field = new DataField(record, {});

      assert.equal(field.record, record);
      assert.equal(field.type, "x");
    });

    it("allows non collection value list", function () {
      [
        "UI.DataField",
        "UI.DataFieldWithAction",
        "UI.DataFieldWithIntentBasedNavigation",
        "UI.DataFieldWithNavigationPath",
        "UI.DataFieldWithUrl",
      ].forEach((t) => {
        let prop = {};
        let field = new DataField(
          {
            type: t,
            value: {
              Value: {},
            },
          },
          {
            getProperty: () => prop,
          }
        );

        assert.equal(field.property, prop);
      });
    });

    it("throws error on missing value property", function () {
      let record = {
        type: "UI.DataField",
        value: {},
      };

      assert.throws(() => new DataField(record, {}));
    });
  });
});
