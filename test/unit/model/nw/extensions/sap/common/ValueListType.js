"use strict";

const assert = require("assert");
const sinon = require("sinon");

const ValueListType = require("../../../../../../../lib/model/nw/extensions/sap/common/ValueListType");

const strictSettings = {
  strict: true,
};

const nonStrictSettings = {
  strict: false,
  logger: {
    warn: sinon.stub(),
  },
};

const entitySet1 = {};
const container = {
  getEntitySet: (name) => {
    if (name !== "EntitySet1") {
      throw new Error("Blah");
    }

    return entitySet1;
  },
};

const schema = {
  getEntityContainer: () => container,
};

function getAnnotation(collectionPath) {
  return {
    record: {
      value: {
        CollectionPath: {
          string: collectionPath,
        },
      },
    },
  };
}

describe("ValueListType", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let annotation = getAnnotation("EntitySet1");
      let valueList = new ValueListType(annotation, schema, strictSettings);

      assert.equal(valueList.annotation, annotation);
      assert.equal(valueList.collectionPath, "EntitySet1");
      assert.equal(valueList.collection, entitySet1);
    });

    it("allows non collection value list", function () {
      let annotation = {};
      let valueList = new ValueListType(annotation, schema, strictSettings);
      assert.equal(valueList.annotation, annotation);
    });

    it("throws error on missing collection in strict mode", function () {
      let annotation = getAnnotation("NotAnEntitySet");
      assert.throws(
        () => new ValueListType(annotation, schema, strictSettings)
      );
    });

    it("allows incorrect collection path in non-strict mode", function () {
      let annotation = getAnnotation("NotAnEntitySet");
      let valueList = new ValueListType(annotation, schema, nonStrictSettings);
      assert.equal(valueList.collectionPath, "NotAnEntitySet");
      assert.ok(!valueList.collection);
      assert.ok(nonStrictSettings.logger.warn.called);
    });
  });
});
