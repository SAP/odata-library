"use strict";

const assert = require("assert");
const sinon = require("sinon");
const NavigationProperty = require("../../../lib/engine/NavigationProperty");
const Parent = require("../../../lib/engine/QueryableResource");
const sandbox = sinon.createSandbox();

describe("NavigationProperty", function () {
  let navigationProperty;
  let innerSource;
  let innerAgent;
  let innerNavigationProperty;

  beforeEach(function () {
    innerAgent = {};
    innerSource = {
      agent: innerAgent,
      metadata: {
        getEntitySet: sinon.stub(),
      },
    };

    innerNavigationProperty = {
      fromRole: "FromRole",
      toRole: "ToRole",
      relationship: "Relationship",
      getTarget: sinon.stub().returns({
        associationEnd: {},
        entitySet: {
          getLegacyApiObject: () => {},
        },
        entityType: {
          getLegacyApiObject: () => {},
          key: [
            {
              name: "KEY1",
              type: {
                format: (x) => x,
              },
            },
            {
              name: "KEY2",
              type: {
                format: (x) => x,
              },
            },
          ],
          navigationProperties: [],
        },
      }),
    };
    navigationProperty = new NavigationProperty(
      innerSource,
      innerNavigationProperty,
      {
        model: {
          getSchema: sinon.stub(),
        },
      }
    );
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("#constructor()", function () {
    it("Properties are initialized", function () {
      assert.deepEqual(navigationProperty.agent, innerAgent);
      assert.deepEqual(
        navigationProperty.navigationProperty,
        innerNavigationProperty
      );
      assert.deepEqual(navigationProperty.source, innerSource);
      assert.ok(navigationProperty.reset instanceof Function);
      assert.deepEqual(
        navigationProperty.defaultRequest,
        navigationProperty._defaults
      );
    });

    it("v4 collection type target", function () {
      let elementType = {};
      navigationProperty = new NavigationProperty(
        innerSource,
        {
          isCollection: true,
          getTarget: sinon.stub().returns({
            entitySet: {},
            entityType: {
              elementType: elementType,
            },
          }),
        },
        {
          model: {
            getSchema: sinon.stub(),
          },
        }
      );

      assert.strictEqual(navigationProperty.entityTypeModel, elementType);
    });
  });

  describe(".isMultiple()", function () {
    it("Has 0..1 multiplicity", function () {
      navigationProperty.target.isMultiple = false;
      assert.ok(!navigationProperty.isMultiple());
    });

    it("Has * multiplicity", function () {
      navigationProperty.target.isMultiple = true;
      assert.ok(navigationProperty.isMultiple());
    });
  });

  describe(".key()", function () {
    it("Is multiple association", function () {
      sinon.stub(navigationProperty, "isMultiple").returns(true);
      sinon
        .stub(Parent.prototype, "key")
        .returns(navigationProperty.defaultRequest);
      sinon.stub(navigationProperty.defaultRequest, "registerAssociations");

      assert.strictEqual(
        navigationProperty.key("PARAMS"),
        navigationProperty.defaultRequest
      );

      assert.ok(Parent.prototype.key.calledWith("PARAMS"));
      assert.ok(!navigationProperty.defaultRequest.registerAssociations.called);

      Parent.prototype.key.restore();
    });

    it("Is single association", function () {
      sinon.stub(navigationProperty, "isMultiple").returns(false);
      sinon.stub(Parent.prototype, "key");
      sinon
        .stub(navigationProperty.defaultRequest, "registerAssociations")
        .returns(navigationProperty.defaultRequest);

      assert.strictEqual(
        navigationProperty.key("PARAMS"),
        navigationProperty.defaultRequest
      );

      assert.ok(!Parent.prototype.key.called);
      assert.ok(navigationProperty.defaultRequest.registerAssociations.called);

      Parent.prototype.key.restore();
    });
  });

  it(".createNavigationProperty()", function () {
    let navigationPropertyMD = {
      relationship: "Namespace.Association",
      getTarget: sinon.stub().returns({
        entitySet: {
          entityType: {
            getLegacyApiObject: sinon.stub(),
          },
          getLegacyApiObject: sinon.stub(),
        },
      }),
    };
    let metadata = {
      model: {
        getSchema: sinon.stub(),
      },
    };

    assert.ok(
      navigationProperty.createNavigationProperty(
        metadata,
        navigationPropertyMD
      ) instanceof NavigationProperty
    );
  });

  it(".reset()", function () {
    navigationProperty._requestDefinition = "REQUEST_DEFINITION";
    innerSource.reset = sinon.stub();
    sandbox.spy(Parent.prototype, "reset");
    navigationProperty.reset();
    assert.strictEqual(navigationProperty._requestDefinition, undefined);
    assert.ok(innerSource.reset.called);
    assert.ok(Parent.prototype.reset.called);
  });
});
