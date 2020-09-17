"use strict";

const assert = require("assert");
const Record = require("../../../../../lib/model/oasis/annotations/Record");
const builder = {
  scalarExpressions: ["A", "B"],
  buildAnnotation: (x) => x,
  buildCollection: (x) => x,
  buildRecord: (x) => x,
  buildPropertyValue: (x) => ({
    property: x.Property,
  }),
  assignElementValue: () => {},
};

describe("Record", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let md = {
        $: {
          Type: "t",
        },
        PropertyValue: [
          {
            Property: "P1",
            String: "s1",
          },
        ],
      };
      let record = new Record(md, builder);
      assert.equal(record.raw, md);
      assert.strictEqual(record.type, "t");
      assert.strictEqual(record.annotations.length, 0);
      assert.strictEqual(record.propertyValues.length, 1);
      assert.equal(record.value.P1, record.propertyValues[0]);
    });

    it("allows mising type", function () {
      let record = new Record({}, builder);
      assert.equal(record.type, undefined);
    });
  });
});
