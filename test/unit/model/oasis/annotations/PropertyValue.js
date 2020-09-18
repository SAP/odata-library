"use strict";

const assert = require("assert");
const PropertyValue = require("../../../../../lib/model/oasis/annotations/PropertyValue");
const builder = {
  buildAnnotation: (x) => x,
  buildCollection: (x) => x,
  buildRecord: (x) => x,
  buildPropertyValue: (x) => x,
  assignElementValue: () => {},
};

describe("PropertyValue", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let anno = {};
      let md = {
        $: {
          Property: "p",
        },
        Annotation: [anno],
      };

      let propertyValue = new PropertyValue(md, builder);
      assert.strictEqual(propertyValue.property, "p");
      assert.equal(propertyValue.raw, md);
      assert.equal(propertyValue.annotations.length, 1);
      assert.equal(propertyValue.annotations[0], anno);
    });

    it("throws error on missing property", function () {
      assert.throws(() => new PropertyValue({}, builder));
    });
  });
});
