"use strict";

const assert = require("assert").strict;
const SideEffectsType = require("../../../../../../../lib/model/nw/extensions/sap/common/SideEffectsType");
const sinon = require("sinon");
const sandbox = sinon.createSandbox();

describe("SideEffectsType", function () {
  afterEach(function () {
    sandbox.restore();
  });
  describe("#constructor()", function () {
    let entityType;
    let annotation = {
      record: {
        value: {
          SourceEntities: {
            collection: ["a"],
          },
          SourceProperties: {
            collection: ["a"],
          },
          TargetEntities: {
            collection: ["a", "b"],
          },
          TargetProperties: {
            collection: ["a", "b"],
          },
        },
      },
    };

    beforeEach(function () {
      entityType = {
        getNavigationProperty: sinon.stub().returns("navProp"),
        getProperty: sinon.stub().returns("prop"),
      };
    });

    it("initializes properties", function () {
      let sideEffects = new SideEffectsType(annotation, entityType, "SCHEMA", {
        strict: true,
      });

      assert.equal(sideEffects.annotation, annotation);

      assert.ok(sideEffects.hasOwnProperty("sourceEntities"));
      assert.ok(sideEffects.hasOwnProperty("sourceProperties"));
      assert.ok(sideEffects.hasOwnProperty("targetEntities"));
      assert.ok(sideEffects.hasOwnProperty("targetProperties"));

      assert.strictEqual(sideEffects.sourceEntities.length, 1);
      assert.strictEqual(sideEffects.sourceProperties.length, 1);
      assert.strictEqual(sideEffects.targetEntities.length, 2);
      assert.strictEqual(sideEffects.targetProperties.length, 2);

      assert.strictEqual(sideEffects.sourceEntities[0], "navProp");
      assert.strictEqual(sideEffects.sourceProperties[0], "prop");
      assert.strictEqual(sideEffects.targetEntities[0], "navProp");
      assert.strictEqual(sideEffects.targetProperties[0], "prop");

      assert.deepEqual(entityType.getProperty.args[0], ["a", true]);
      assert.deepEqual(entityType.getNavigationProperty.args[0], ["a", true]);
    });

    it("define target property as path", function () {
      let sideEffects;
      let transformer;
      let target = {
        entityType: {
          getProperty: sinon
            .stub()
            .returns("PROPERTY_FROM_NAVIGATION_PROPERTY"),
        },
      };
      let navigationProperty = {
        getTarget: sinon.stub().returns(target),
      };

      sandbox.stub(SideEffectsType._, "definePropertyCollection");
      sideEffects = new SideEffectsType(annotation, entityType, "SCHEMA", {
        strict: true,
      });
      assert.ok(
        SideEffectsType._.definePropertyCollection
          .getCall(3)
          .calledWith(sideEffects, "TargetProperties")
      );
      transformer =
        SideEffectsType._.definePropertyCollection.getCall(3).args[2];

      entityType.getProperty = sinon.stub().returns("PROPERTY");
      entityType.getNavigationProperty = sinon
        .stub()
        .returns(navigationProperty);

      assert.equal(
        transformer("navigationPropertyName/propertyName"),
        "PROPERTY_FROM_NAVIGATION_PROPERTY"
      );
      assert.ok(navigationProperty.getTarget.calledWithExactly("SCHEMA"));
      assert.ok(entityType.getProperty.notCalled);
    });
  });
});
