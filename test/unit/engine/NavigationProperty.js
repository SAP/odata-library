"use strict";

const assert = require("assert");
const sinon = require("sinon");
const _ = require("lodash");
const NavigationProperty = require("../../../lib/engine/NavigationProperty");
const Parent = require("../../../lib/engine/QueryableResource");
const sandbox = sinon.createSandbox();

describe("NavigationProperty", function () {
  let navigationProperty;
  let innerSource;
  let innerAgent;
  let innerNavigationProperty;

  beforeEach(function () {
    innerAgent = {
      fetchToken: async () => "token",
    };
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

  describe(".get()", function () {
    let request;
    beforeEach(() => {
      sinon.stub(navigationProperty, "reset");

      innerAgent.get = sinon.stub().returns(
        Promise.resolve({
          body: {
            d: {
              KEY: "VALUE",
            },
          },
        })
      );
      innerAgent.getResultPath = sinon.stub().returns("body.d");
      request = navigationProperty.defaultRequest;
      sinon.stub(request, "header");
      request._headers = {};
      innerNavigationProperty.name = "NAVIGATION";
      innerSource.getSingleResourcePath = sinon
        .stub()
        .returns("PARENT(PREDICATE)");
      innerAgent.batchManager = {};
    });
    it("Successfully gets entity from list", function () {
      sinon.stub(navigationProperty, "isMultiple").returns(true);
      navigationProperty.key({
        KEY1: "VALUE1",
        KEY2: "VALUE2",
      });
      return navigationProperty.get().then((res) => {
        assert(request.header.calledWith("Accept", "application/json"));
        assert(navigationProperty.reset.called);
        let args = innerAgent.get.args[0];
        assert.deepEqual(
          args[0],
          "/PARENT(PREDICATE)/NAVIGATION(KEY1=VALUE1,KEY2=VALUE2)?$format=json"
        );
        assert.deepEqual(args[1], {});
        assert.deepEqual(res, {
          KEY: "VALUE",
        });
      });
    });
    it("Successfully gets list of entities", function () {
      sinon.stub(navigationProperty, "isMultiple").returns(true);
      innerAgent.getResultPath.returns("body.d.results");
      innerAgent.get = sinon.stub().returns(
        Promise.resolve({
          body: {
            d: {
              results: [
                {
                  KEY1: "VALUE1",
                  KEY2: "VALUE2",
                },
              ],
            },
          },
        })
      );
      request._resource.entityTypeModel.hasStream = false;
      return navigationProperty.get().then((res) => {
        assert(request.header.calledWith("Accept", "application/json"));
        assert(navigationProperty.reset.called);
        assert.deepEqual(res, [
          {
            KEY1: "VALUE1",
            KEY2: "VALUE2",
          },
        ]);
        assert(
          innerAgent.get.calledWithExactly(
            "/PARENT(PREDICATE)/NAVIGATION?$format=json&$skip=0&$top=100",
            request._headers,
            undefined,
            false
          )
        );
      });
    });
    it("Successfully gets entity in raw", function () {
      sinon.stub(navigationProperty, "isMultiple").returns(false);
      navigationProperty.defaultRequest._isRaw = true;
      request._resource.entityTypeModel.hasStream = false;
      sinon.stub(navigationProperty, "determineRequestHeaders");

      return navigationProperty.get().then((res) => {
        assert(navigationProperty.determineRequestHeaders.called);
        assert(navigationProperty.reset.called);
        assert.deepEqual(res, {
          body: {
            d: {
              KEY: "VALUE",
            },
          },
        });
        assert(
          innerAgent.get.calledWithExactly(
            "/PARENT(PREDICATE)/NAVIGATION?$format=json",
            request._headers,
            undefined,
            false
          )
        );
      });
    });
    it("Successfully received data in invalid", function () {
      sinon.stub(navigationProperty, "isMultiple").returns(false);
      innerAgent.get.returns(
        Promise.resolve({
          body: {},
        })
      );
      return navigationProperty.get().then((res) => {
        assert(request.header.calledWith("Accept", "application/json"));
        assert(navigationProperty.reset.called);
        assert.strictEqual(res, undefined);
        assert(
          innerAgent.get.calledWith(
            "/PARENT(PREDICATE)/NAVIGATION?$format=json",
            request._headers
          )
        );
      });
    });
    it("Invalid response", function () {
      sinon.stub(navigationProperty, "isMultiple").returns(false);
      innerAgent.get.returns(Promise.reject(new Error("ERROR")));
      return navigationProperty.get().catch((err) => {
        assert(_.isError(err));
        assert(request.header.calledWith("Accept", "application/json"));
        assert(navigationProperty.reset.called);
        assert(
          innerAgent.get.calledWith(
            "/PARENT(PREDICATE)/NAVIGATION?$format=json",
            request._headers
          )
        );
      });
    });
  });

  describe(".post()", function () {
    let body;
    let request;
    beforeEach(function () {
      body = {
        keyParameter: "keyValue",
        parameter: "value",
      };
      sinon.stub(navigationProperty, "reset");
      sinon
        .stub(navigationProperty, "bodyProperties")
        .returns("BODY_PROPERTIES");

      innerAgent.fetchToken = sinon.stub().returns(Promise.resolve("TOKEN"));
      innerAgent.getResultPath = sinon.stub().returns("body.d");
      innerAgent.post = sinon.stub().returns({
        body: {
          d: "RESPONSE",
        },
      });
      request = navigationProperty.defaultRequest;
      sinon.stub(request, "header");
      sinon.stub(request, "payload");
      request._headers = {};
      innerNavigationProperty.name = "NAVIGATION";
      innerSource.getSingleResourcePath = sinon
        .stub()
        .returns("PARENT(PREDICATE)");
      innerAgent.batchManager = {};
    });
    it("Successfully creates entity and return parsed data", function () {
      request._payload = "BODY_PROPERTIES";
      return navigationProperty.post(body).then((res) => {
        assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
        assert.ok(request.header.calledWith("x-csrf-token", "TOKEN"));
        assert.ok(
          request.header.calledWith("Content-type", "application/json")
        );
        assert.ok(request.header.calledWith("Accept", "application/json"));
        assert.ok(navigationProperty.reset.called);
        assert.deepEqual(res, "RESPONSE");
        assert.ok(
          innerAgent.post.calledWith(
            "/PARENT(PREDICATE)/NAVIGATION",
            request._headers,
            "BODY_PROPERTIES"
          )
        );
      });
    });
    it("Successfully creates entity and return raw data", function () {
      request._payload = "BODY_PROPERTIES";
      return navigationProperty
        .raw(true)
        .post(body)
        .then((res) => {
          assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
          assert.deepEqual(res, {
            body: {
              d: "RESPONSE",
            },
          });
        });
    });
    it("Failed to load CSRF toknen", function () {
      innerAgent.fetchToken = sinon
        .stub()
        .returns(Promise.reject(new Error("ERROR")));
      return navigationProperty
        .raw(true)
        .post(body)
        .catch((err) => {
          assert.ok(request.header.notCalled);
          assert.equal(err.message, "ERROR");
        });
    });
    it("Failed to create entity", function () {
      innerAgent.post = sinon
        .stub()
        .returns(Promise.reject(new Error("ERROR")));
      return navigationProperty
        .raw(true)
        .post(body)
        .catch((err) => {
          assert.ok(request.header.called);
          assert.equal(err.message, "ERROR");
        });
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
