"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const ComplexType = require("../../../../lib/model/schema/ComplexType");

describe("lib/model/schema/ComplexType", function () {
  let complexType;

  beforeEach(function () {
    complexType = new ComplexType();
  });

  describe("formatBody", function () {
    it("format content", function () {
      complexType.properties = [
        {
          name: "valueA",
          type: {
            formatBody: sinon.stub().returnsArg(0),
          },
        },
        {
          name: "valueB",
          type: {
            formatBody: sinon.stub().returnsArg(0),
          },
        },
      ];
      assert.deepEqual(
        complexType.formatBody({
          valueA: "VALUE_A",
          valueB: "VALUE_B",
        }),
        {
          valueA: "VALUE_A",
          valueB: "VALUE_B",
        }
      );
    });
    it("ignore property which is not defined", function () {
      complexType.properties = [
        {
          name: "valueA",
          type: {
            formatBody: sinon.stub().returnsArg(0),
          },
        },
      ];
      assert.deepEqual(
        complexType.formatBody({
          valueA: "VALUE_A",
          valueB: "VALUE_B",
        }),
        {
          valueA: "VALUE_A",
        }
      );
    });
    it("formatBody is mandatory for property types", function () {
      complexType.properties = [
        {
          name: "valueA",
          type: {
            formatBody: sinon.stub().returnsArg(0),
          },
        },
        {
          name: "valueB",
        },
      ];
      assert.throws(function () {
        complexType.formatBody({
          valueA: "VALUE_A",
          valueB: "VALUE_B",
        });
      });
    });
  });
});
