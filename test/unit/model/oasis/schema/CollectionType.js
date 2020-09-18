"use strict";

const assert = require("assert");
const CollectionType = require("../../../../../lib/model/oasis/schema/CollectionType");

describe("CollectionType (oasis)", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let elementType = {};
      let type = new CollectionType(elementType);
      assert.equal(type.elementType, elementType);
    });
  });
});
