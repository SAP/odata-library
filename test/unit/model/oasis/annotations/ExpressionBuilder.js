"use strict";

const _ = require("lodash");
const assert = require("assert");
const ExpressionBuilder = require("../../../../../lib/model/oasis/annotations/ExpressionBuilder");

const scalarExpressions = [
  "AnnotationPath",
  "NavigationPropertyPath",
  "Path",
  "PropertyPath",

  "Binary",
  "Bool",
  "Date",
  "DateTimeOffset",
  "Decimal",
  "Duration",
  "EnumMember",
  "Float",
  "Guid",
  "Int",
  "String",
  "TimeOfDay",
];

describe("ExpressionBuilder", function () {
  it("provides Scalar Expression types list", function () {
    scalarExpressions.forEach((type) =>
      assert.ok(ExpressionBuilder.scalarExpressions.includes(type))
    );
  });

  it("builds annotations", function () {
    let item = ExpressionBuilder.buildAnnotation({
      $: {
        Term: "T1",
      },
    });

    assert.equal(item.constructor.name, "Annotation");
  });

  it("builds collections", function () {
    let item = ExpressionBuilder.buildCollection({});
    assert.equal(item.constructor.name, "Collection");
  });

  it("builds records", function () {
    let item = ExpressionBuilder.buildRecord({});
    assert.equal(item.constructor.name, "Record");
  });

  it("builds property values", function () {
    let item = ExpressionBuilder.buildPropertyValue({
      $: {
        Property: "P1",
      },
    });

    assert.equal(item.constructor.name, "PropertyValue");
  });

  describe("assignElementValue", function () {
    it("assigns constant expressions from attributes", function () {
      scalarExpressions.forEach((e) => {
        let element = {
          raw: {
            $: {
              [e]: "X",
            },
          },
        };

        ExpressionBuilder.assignElementValue(element, "id");
        assert.strictEqual(element[_.lowerFirst(e)], "X");
      });
    });

    it("assigns constant expressions child elements", function () {
      scalarExpressions.forEach((e) => {
        let element = {
          raw: {
            [e]: ["X"],
          },
        };

        ExpressionBuilder.assignElementValue(element, "id");
        assert.strictEqual(element[_.lowerFirst(e)], "X");
      });
    });

    it("assigns Collections", function () {
      let element = {
        raw: {
          Collection: [
            {
              String: ["X"],
            },
          ],
        },
      };

      ExpressionBuilder.assignElementValue(element, "id");
      assert.equal(element.collection.constructor.name, "Collection");
      assert.deepEqual(element.collection, ["X"]);
    });

    it("assigns Records", function () {
      let element = {
        raw: {
          Record: ["X"],
        },
      };

      ExpressionBuilder.assignElementValue(element, "id");
      assert.equal(element.record.constructor.name, "Record");
      assert.deepEqual(element.record, {});
    });

    it("throws error when multiple values are specified", function () {
      let element = {
        raw: {
          String: ["X", "Y"],
        },
      };

      assert.throws(() => ExpressionBuilder.assignElementValue(element, "id"));

      element = {
        raw: {
          String: ["X"],
          Record: ["X"],
        },
      };

      assert.throws(() => ExpressionBuilder.assignElementValue(element, "id"));
    });
  });
});
