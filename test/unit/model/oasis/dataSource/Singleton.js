"use strict";

const _ = require("lodash");
const assert = require("assert");
const sinon = require("sinon");
const Singleton = require("../../../../../lib/model/oasis/dataSource/Singleton");
const sampleMD = {
  $: {
    Name: "name",
    Type: "type",
  },
  NavigationPropertyBinding: [
    {
      $: {
        Path: "p",
        Target: "t",
      },
    },
  ],
};

const type = {};
const sampleSchema = {
  resolveModelPath: sinon.stub().returns(type),
};

describe("Singleton", function () {
  describe("#constructor()", function () {
    it("initializes basic properties", function () {
      let s = new Singleton(sampleMD, sampleSchema);
      assert.equal(s.raw, sampleMD);
      assert.equal(s.name, "name");
      assert.equal(s.type, type);
      assert.ok(_.isArray(s.navigationPropertyBindings));
      assert.equal(s.navigationPropertyBindings.length, 1);
    });

    it("uses defaults", function () {
      let s = new Singleton(
        {
          $: {
            Name: "name",
            Type: "type",
          },
        },
        sampleSchema
      );
      assert.ok(_.isArray(s.navigationPropertyBindings));
    });

    it("throws error on missing name or type", function () {
      assert.throws(
        () =>
          new Singleton({
            $: {
              Type: "type",
            },
          })
      );

      assert.throws(
        () =>
          new Singleton({
            $: {
              Name: "name",
            },
          })
      );
    });
  });
});
