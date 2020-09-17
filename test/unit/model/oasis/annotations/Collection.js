"use strict";

const assert = require("assert");
const sinon = require("sinon");
const Collection = require("../../../../../lib/model/oasis/annotations/Collection");
const builder = {
  scalarExpressions: ["A", "B"],
  buildAnnotation: (x) => x,
  buildCollection: (x) => x,
  buildRecord: (x) => x,
  assignElementValue: () => {},
};

describe("Collection", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let md = {};
      let collection = new Collection(md, builder);
      assert.equal(collection.raw, md);
      assert.equal(collection.length, 0);
    });

    it("consumes scalar values", function () {
      ["A", "B"].forEach((t) => {
        let collection = new Collection(
          {
            [t]: [1, 2],
          },
          builder
        );

        assert.equal(collection.length, 2);
      });
    });

    it("consumes structure values", function () {
      let rec = {};
      let build = sinon.stub().returns(rec);
      let collection = new Collection(
        {
          Record: [{}],
        },
        {
          buildRecord: build,
          scalarExpressions: [],
        }
      );

      assert.ok(build.called);
      assert.equal(collection.length, 1);
      assert.equal(collection[0], rec);
    });

    it("handles empty collection", function () {
      let collection = new Collection("", builder);
      assert.equal(collection.length, 0);
    });

    it("throws error on unknown structure type", function () {
      let md = {
        Something: ["s"],
      };

      assert.throws(() => new Collection(md, builder));
    });

    it("throws error on type incompatibility", function () {
      let md = {
        String: ["s"],
        Int: [1],
      };

      assert.throws(() => new Collection(md, builder));
    });
  });
});
