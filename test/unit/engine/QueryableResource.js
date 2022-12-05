"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const responseType = require("../../../lib/engine/responseType");
const requestPut = require("../../../lib/engine/request/put");
const _ = require("lodash");
const sandbox = sinon.createSandbox();
const parsers = require("../../../lib/agent/parsers");
const defaultType = {
  format: (x) => `'${x}'`,
  formatBody: (x) => x,
};

const validProps = ["Property_1", "Property_2", "$Property_1", "$Property_2"];

/* eslint-disable max-statements */
describe("QueryableResource", function () {
  let QueryableResource;
  let entitySet;
  let innerAgent;
  let innerMetadata;
  let innerEntitySetModel;
  let innerEntityTypeModel;

  beforeEach(function () {
    innerAgent = {};
    innerMetadata = {};
    innerEntityTypeModel = {
      getLegacyApiObject: () => {},
      getProperty: (name) => {
        if (!validProps.includes(name)) {
          throw Error(`Invalid property name '${name}'`);
        }

        return {
          sap: {
            sortable: true,
          },
          name: name,
          type: defaultType,
        };
      },
      key: [],
      navigationProperties: [],
    };
    innerEntitySetModel = {
      entityType: innerEntityTypeModel,
      getLegacyApiObject: () => {},
      sap: {},
    };

    QueryableResource = proxyquire("../../../lib/engine/QueryableResource", {});
    entitySet = new QueryableResource(
      innerAgent,
      innerMetadata,
      innerEntitySetModel,
      innerEntityTypeModel
    );
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("#constructor()", function () {
    it("Properties are initialized", function () {
      const defaultKeys = ["_headers", "_isRaw", "_query"];
      assert.deepEqual(entitySet.agent, innerAgent);
      assert.deepEqual(entitySet.entitySetModel, innerEntitySetModel);
      assert.deepEqual(entitySet.entityTypeModel, innerEntityTypeModel);
      assert.ok(entitySet.reset instanceof Function);
      assert.deepEqual(
        _.pick(entitySet.defaultRequest, defaultKeys),
        _.pick(entitySet._defaults, defaultKeys)
      );
    });
  });

  describe(".search()", function () {
    it("Run search on not searchable EntitySet raises error", function () {
      assert.throws(() => {
        entitySet.search("PATTERN");
      }, /EntitySet/);
    });
    it("Run search on searchable EntitySet with invalid pattern", function () {
      innerEntitySetModel.sap.searchable = true;
      assert.throws(() => {
        entitySet.search(100);
      }, /pattern/);
    });
    it("Returns itself for chaining", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      innerEntitySetModel.sap.searchable = true;
      const reference = entitySet.search("PATTERN");
      assert.ok(reference === entitySet);
    });
    it("Run search on searchable EntitySet with invalid pattern", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      innerEntitySetModel.sap.searchable = true;
      entitySet.search("PATTERN");
      assert.ok(
        entitySet.defaultRequest.setQueryParameter.calledWithExactly(
          "search",
          "PATTERN"
        )
      );
    });
  });

  describe(".select()", function () {
    beforeEach(() => {
      entitySet.reset();
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      /* eslint-disable camelcase */
      innerEntityTypeModel.properties = {
        Property_1: {
          name: "Property_1",
          type: defaultType,
        },
        Property_2: {
          name: "Property_2",
          type: defaultType,
        },
      };
      /* eslint-enable camelcase */
    });
    it("Invalid property raises error", function () {
      assert.throws(() => {
        entitySet.select({});
      });
      assert.throws(() => {
        entitySet.select(true);
      });
      assert.throws(() => {
        entitySet.select(undefined);
      });
    });
    it("Property which does not exists raises error", function () {
      assert.throws(() => {
        entitySet.select("Blud");
      });
    });
    it("Returns itself for chaining", function () {
      const reference = entitySet.select("Property_1");
      assert.ok(reference === entitySet);
    });
    it("Pass one property name to select clause", function () {
      entitySet.select("Property_1");
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$select", "Property_1"]
      );
    });
    it("Pass more property names to select clause as parameters", function () {
      entitySet.select("Property_1", "Property_2");
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$select", "Property_1,Property_2"]
      );
    });
    it("Pass more property names to select clause as array", function () {
      entitySet.select(["Property_1", "Property_2"]);
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$select", "Property_1,Property_2"]
      );
    });
    /* eslint-disable camelcase */
    it("Correctli encode property names", function () {
      innerEntityTypeModel.properties = {
        $Property_1: {
          Name: "$Property_1",
        },
        $Property_2: {
          Name: "$Property_2",
        },
      };
      /* eslint-enable camelcase */
      entitySet.select(["$Property_1", "$Property_2"]);
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$select", "%24Property_1,%24Property_2"]
      );
    });
  });

  describe(".expand()", function () {
    beforeEach(() => {
      entitySet.reset();
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      innerMetadata.model = {
        getSchema: sinon.stub().returns("schema"),
      };
      let navigationProperty = {
        getTarget: sinon.stub().returns({
          entityType: innerEntityTypeModel,
        }),
      };
      let callback = sinon.stub();
      callback.withArgs("navProperty").returns(navigationProperty);
      callback.withArgs("unexistingNavProperty").returns(new Error());
      innerEntityTypeModel.getNavigationProperty = callback;
    });
    it("Invalid property raises error", function () {
      assert.throws(() => {
        entitySet.expand({});
      });
      assert.throws(() => {
        entitySet.expand(true);
      });
      assert.throws(() => {
        entitySet.expand(undefined);
      });
    });
    it("Property which does not exists raises error", function () {
      assert.throws(() => {
        entitySet.expand("unexistingNavProperty");
      });
    });
    it("Returns itself for chaining", function () {
      const reference = entitySet.expand("navProperty");
      assert.ok(reference === entitySet);
    });
    it("Pass one navigation property name to expand clause", function () {
      entitySet.expand("navProperty");
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$expand", "navProperty"]
      );
    });
    it("Pass more property names to expand clause as parameters", function () {
      entitySet.expand("navProperty", "navProperty");
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$expand", "navProperty,navProperty"]
      );
    });
    it("Pass more property names to expand clause as array", function () {
      entitySet.expand(["navProperty", "navProperty"]);
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$expand", "navProperty,navProperty"]
      );
    });
    it("Expand recursive navigation properties", function () {
      entitySet.expand(["navProperty/navProperty", "navProperty/navProperty"]);
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$expand", "navProperty%2FnavProperty,navProperty%2FnavProperty"]
      );
    });
  });

  describe(".top()", function () {
    it("Run top on not pageable EntitySet raises error", function () {
      assert.throws(() => {
        entitySet.top(10);
      }, /EntitySet/);
    });
    it("Invalid top raises error", function () {
      innerEntitySetModel.sap.pageable = true;
      assert.throws(() => {
        entitySet.top("BLUD");
      }, /top value/);
    });
    it("Returns itself for chaining", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      innerEntitySetModel.sap.pageable = true;
      const reference = entitySet.top(100);
      assert.ok(reference === entitySet);
    });
    it("Valid top clause set $top parameter", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      innerEntitySetModel.sap.pageable = true;
      entitySet.top(100);
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$top", 100]
      );
    });
  });

  describe(".skip()", function () {
    it("Run skip on not pageable EntitySet raises error", function () {
      assert.throws(() => {
        entitySet.skip(10);
      }, /EntitySet/);
    });
    it("Invalid skip value raises error", function () {
      innerEntitySetModel.sap.pageable = true;
      assert.throws(() => {
        entitySet.skip("A");
      }, /positive/);
    });
    it("Negative skip value raises error", function () {
      innerEntitySetModel.sap.pageable = true;
      assert.throws(() => {
        entitySet.skip(-1);
      }, /positive/);
    });
    it("Returns itself for chaining", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      innerEntitySetModel.sap.pageable = true;
      const reference = entitySet.skip(0);
      assert.ok(reference === entitySet);
    });
    it("Zero is valid skip parameter.", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      innerEntitySetModel.sap.pageable = true;
      entitySet.skip(0);
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$skip", 0]
      );
    });
    it("Valid skip parameter set query.", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      innerEntitySetModel.sap.pageable = true;
      entitySet.skip(100);
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$skip", 100]
      );
    });
  });

  describe(".filter()", function () {
    it("Returns itself for chaining", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      const reference = entitySet.filter("FILTER_DEFINITION");
      assert.ok(reference === entitySet);
    });
    it("Valid filter clause set $filter parameter", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      entitySet.filter("FILTER_DEFINITION");
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$filter", "FILTER_DEFINITION"]
      );
    });
  });

  describe(".orderby()", function () {
    it("Returns itself for chaining", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      const reference = entitySet.orderby("Property_1", "Property_2 desc");
      assert.ok(reference === entitySet);
    });
    it("Valid sort clause set $orderby parameter", function () {
      sinon.stub(entitySet.defaultRequest, "setQueryParameter");
      entitySet.orderby("Property_1", "Property_2 desc");
      assert.deepEqual(
        entitySet.defaultRequest.setQueryParameter.getCall(0).args,
        ["$orderby", "Property_1%2CProperty_2%20desc"]
      );
    });
  });

  describe(".key()", function () {
    it("Uses request key", function () {
      sinon
        .stub(entitySet.defaultRequest, "key")
        .returns(entitySet.defaultRequest);
      assert.deepEqual(entitySet.key("A"), entitySet);
      assert.ok(entitySet.defaultRequest.key.calledWithExactly("A"));
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
      sinon.stub(entitySet, "_handleAgentCall").returns(Promise.resolve());
      sinon.stub(entitySet, "bodyProperties").returns("BODY_PROPERTIES");
      sinon.stub(entitySet, "getListResourcePath").returns("ENTITY_SET_NAME");
      innerAgent.post = sinon.stub().returns();
      request = entitySet.defaultRequest;
      sinon.stub(request, "header");
      sinon.stub(request, "payload");
      request._headers = {};
      innerAgent.batchManager = {};
    });
    it("Successfully creates entity and return parsed data", function () {
      request._payload = "BODY_PROPERTIES";
      return entitySet
        .post(body)
        .then(() => {
          return entitySet._handleAgentCall.getCall(0).args[0](request);
        })
        .then(() => {
          assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
          assert.ok(
            request.header.calledWith("Content-Type", "application/json")
          );
          assert.ok(
            innerAgent.post.calledWith(
              "/ENTITY_SET_NAME",
              request._headers,
              JSON.stringify("BODY_PROPERTIES")
            )
          );
        });
    });
    it("Failed to create entity", function () {
      entitySet._handleAgentCall.returns(Promise.reject(new Error("ERROR")));
      return entitySet
        .raw(true)
        .post(body)
        .catch((err) => {
          assert.equal(err.message, "ERROR");
        });
    });
    it("Successfully creates entity and return parsed data inside batch", function () {
      let cb;
      let post = sinon.stub();
      innerAgent.batchManager = {
        defaultBatch: {
          post: post,
        },
        defaultChangeSet: "DEFAULT_CHANGESET",
      };
      sinon.stub(entitySet, "_handleBatchCall").returns("PROMISE");
      request._payload = "BODY_PROPERTIES";

      assert.ok(entitySet.post(body), "PROMISE");

      cb = entitySet._handleBatchCall.getCall(0).args[0];
      cb();

      assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
      assert.ok(request.header.calledWithExactly("Accept", "application/json"));
      assert.strictEqual(
        entitySet._handleBatchCall.getCall(0).args[1],
        innerAgent.batchManager.defaultBatch
      );
    });
  });

  it(".put", function () {
    sandbox.stub(requestPut, "call");
    entitySet.put("BODY");
    assert.ok(requestPut.call.calledWithExactly("BODY", entitySet));
  });

  describe(".processUpdateCall()", function () {
    let newData;
    let request;
    beforeEach(() => {
      newData = {
        parameter: "value",
      };
      sinon.stub(entitySet, "bodyProperties").returns("BODY_PROPERTIES");
      sinon.stub(entitySet, "reset");
      sinon.stub(entitySet, "header");
      innerEntityTypeModel.key = [
        {
          name: "keyParameter",
          type: defaultType,
        },
      ];
      innerAgent.getResultPath = sinon.stub().returns("body.d");
      innerAgent.merge = sinon.stub().returns(
        Promise.resolve({
          ok: true,
        })
      );
      request = entitySet.defaultRequest;
      sinon.stub(request, "header");
      sinon.stub(request, "payload");
      request._headers = {};
      request._isRaw = false;
      innerEntitySetModel.name = "ENTITY_SET_NAME";
      innerAgent.batchManager = {};
      sinon.stub(entitySet, "_handleAgentCall").returns(Promise.resolve());
    });
    it("Successfully updates an entry by overwriting data", function () {
      let body = Object.assign(
        {
          keyParameter: "keyValue",
        },
        newData
      );
      let response = {};
      innerAgent.merge = sinon.stub().returns(
        Promise.resolve({
          body: {
            d: response,
          },
        })
      );
      request._payload = "BODY_PROPERTIES";
      return entitySet
        .processUpdateCall("merge", body)
        .then(() => {
          assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
          return entitySet._handleAgentCall.getCall(0).args[0](request);
        })
        .then(() => {
          assert(request.header.calledWith("Content-Type", "application/json"));
          assert.deepEqual(innerAgent.merge.getCall(0).args, [
            "/ENTITY_SET_NAME(keyParameter='keyValue')",
            request._headers,
            JSON.stringify("BODY_PROPERTIES"),
          ]);
          assert(entitySet.bodyProperties.calledWith(newData));
          assert.ok(entitySet.header.notCalled);
        });
    });
    it("Successfully updates an entry entity, with response in raw format", function () {
      let body = Object.assign(
        {
          keyParameter: "keyValue",
        },
        newData
      );
      entitySet.raw();
      request._payload = "BODY_PROPERTIES";
      return entitySet
        .processUpdateCall("merge", body)
        .then(() => {
          assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
          return entitySet._handleAgentCall.getCall(0).args[0](request);
        })
        .then(() => {
          assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
          assert(request.header.calledWith("Content-Type", "application/json"));
          assert.deepEqual(innerAgent.merge.getCall(0).args, [
            "/ENTITY_SET_NAME(keyParameter='keyValue')",
            request._headers,
            JSON.stringify("BODY_PROPERTIES"),
          ]);
          assert(entitySet.bodyProperties.calledWith(newData));
        });
    });
    it("Invalid response", function () {
      let body = Object.assign(
        {
          keyParameter: "keyValue",
        },
        newData
      );
      innerAgent.merge = sinon.stub().returns("REJECTED_PROMISE");
      request._payload = "BODY_PROPERTIES";
      return entitySet
        .processUpdateCall("merge", body)
        .then(() => {
          assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
          return entitySet._handleAgentCall.getCall(0).args[0](request);
        })
        .then(() => {
          assert.ok(
            request.header.calledWith("Content-Type", "application/json")
          );
          assert.ok(entitySet._handleAgentCall.getCall(0).args[0](request));
          assert.deepEqual(innerAgent.merge.getCall(0).args, [
            "/ENTITY_SET_NAME(keyParameter='keyValue')",
            request._headers,
            JSON.stringify("BODY_PROPERTIES"),
          ]);
        });
    });
    it("Successfully updates an entry by overwriting data", function () {
      let entityKey = {
        keyParameter: "keyValue",
      };
      request._payload = "BODY_PROPERTIES";
      return entitySet
        .processUpdateCall("merge", entityKey, newData)
        .then(() => {
          return entitySet._handleAgentCall.getCall(0).args[0](request);
        })
        .then(() => {
          assert.deepEqual(innerAgent.merge.getCall(0).args, [
            "/ENTITY_SET_NAME(keyParameter='keyValue')",
            request._headers,
            JSON.stringify("BODY_PROPERTIES"),
          ]);
          assert(entitySet.bodyProperties.calledWith(newData));
        });
    });
    it("Successfully updates an entry by overwriting data including key properties", function () {
      let entityKey = {
        keyParameter: "keyValue",
      };
      // extend attributes to be updated of entity key
      newData = _.assign(newData, entityKey);
      request._payload = "BODY_PROPERTIES";
      request.header = sinon.stub();
      innerAgent.merge = sinon.stub().returns("PROMISE");

      return entitySet
        .processUpdateCall("merge", entityKey, newData)
        .then(() => {
          assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
          assert.ok(entitySet.bodyProperties.calledWith(newData));
          assert.equal(
            entitySet._handleAgentCall.getCall(0).args[0](request),
            "PROMISE"
          );
          assert.ok(
            request.header.calledWithExactly("Content-Type", "application/json")
          );
          assert.deepEqual(innerAgent.merge.getCall(0).args, [
            "/ENTITY_SET_NAME(keyParameter='keyValue')",
            request._headers,
            JSON.stringify("BODY_PROPERTIES"),
          ]);
        });
    });
    it("Successfully merge entity and return parsed data inside batch", function () {
      let cb;
      let merge = sinon.stub();
      let body = Object.assign(
        {
          keyParameter: "keyValue",
        },
        newData
      );

      innerAgent.batchManager = {
        defaultBatch: {
          merge: merge,
        },
        defaultChangeSet: "DEFAULT_CHANGESET",
      };
      request._payload = "BODY_PROPERTIES";
      sinon.stub(entitySet, "_handleBatchCall").returns("PROMISE");

      assert.ok(entitySet.processUpdateCall("merge", body), "PROMISE");

      cb = entitySet._handleBatchCall.getCall(0).args[0];
      cb();

      assert.ok(
        merge.calledWithExactly(
          "/ENTITY_SET_NAME(keyParameter='keyValue')",
          request._headers,
          "BODY_PROPERTIES",
          "DEFAULT_CHANGESET"
        )
      );
      assert.ok(request.header.calledWithExactly("Accept", "application/json"));
      assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
      assert.ok(entitySet.bodyProperties.calledWithExactly(newData));
      assert.strictEqual(
        entitySet._handleBatchCall.getCall(0).args[1],
        innerAgent.batchManager.defaultBatch
      );
    });
  });

  it(".merge()", function () {
    sinon.stub(entitySet, "processUpdateCall").returns("PROMISE");
    assert.strictEqual(entitySet.merge("ARG_1", "ARG_2"), "PROMISE");
    assert.ok(
      entitySet.processUpdateCall.calledWith("merge", "ARG_1", "ARG_2")
    );
  });

  it(".patch()", function () {
    sinon.stub(entitySet, "processUpdateCall").returns("PROMISE");
    assert.strictEqual(entitySet.patch("ARG_1", "ARG_2"), "PROMISE");
    assert.ok(
      entitySet.processUpdateCall.calledWith("patch", "ARG_1", "ARG_2")
    );
  });

  describe(".delete()", function () {
    beforeEach(() => {
      innerAgent.batchManager = {};
      sinon.stub(entitySet, "key");
    });
    it("Successfully deletes an entry", function () {});
  });

  describe(".raw()", function () {
    it("Returns itself for chaining", function () {
      const reference = entitySet.raw();
      assert.ok(reference === entitySet);
    });
    it("Enable raw response", function () {
      let parameters = entitySet.defaultRequest;
      assert.strictEqual(parameters._isRaw, false);
      assert.strictEqual(entitySet.raw(), entitySet);
      assert.strictEqual(parameters._isRaw, true);
      entitySet.raw();
      assert.strictEqual(parameters._isRaw, true);
    });
  });

  describe(".executeGet()", function () {
    beforeEach(() => {
      innerAgent.get = sinon.stub().returns(Promise.resolve());
      innerAgent.getResultPath = sinon.stub().returns("a.b.c");
      innerAgent.batchManager = {};
    });

    it("Successfully gets entity", function () {
      let request = {
        _path: "PATH",
        _headers: "HEADERS",
        _resource: {
          entityTypeModel: {
            hasStream: "HAS_STREAM",
          },
        },
      };
      sinon.stub(entitySet, "_handleAgentCall").returns(Promise.resolve());
      return entitySet.executeGet(request).then(() => {
        assert.equal(entitySet._handleAgentCall.getCall(0).args[1], request);
        entitySet._handleAgentCall.getCall(0).args[0]();
        assert.ok(innerAgent.get.calledWithExactly("PATH", "HEADERS"));
      });
    });

    it("Successfully get entity in batch", function () {
      const getMethod = sinon.stub();
      const request = entitySet.request();

      let cb;

      sinon.stub(request, "header");
      request._path = "PATH";
      request._headers = {};
      innerAgent.batchManager = {
        defaultBatch: {
          get: getMethod,
        },
        defaultChangeSet: "DEFAULT_CHANGESET",
      };
      sinon.stub(entitySet, "_handleBatchCall").returns("PROMISE");
      sinon.stub(request, "calculatePath");
      sandbox.stub(responseType, "determine").returns("RESPONSE_TYPE");

      assert.ok(entitySet.executeGet(request), "PROMISE");

      cb = entitySet._handleBatchCall.getCall(0).args[0];
      cb();

      assert.ok(request.calculatePath.called);
      assert.ok(
        getMethod.calledWithExactly(
          "PATH",
          request._headers,
          "DEFAULT_CHANGESET",
          "RESPONSE_TYPE"
        )
      );
      assert.ok(request.header.calledWith("Accept", "application/json"));
    });
  });

  describe(".count()", function () {
    it("count by default request", function () {
      entitySet._requestDefinition = {
        count: sinon.stub().returns(Promise.resolve()),
      };
      return entitySet.count().then(() => {
        assert.ok(entitySet._requestDefinition.count.called);
      });
    });
    it("count by expricit", function () {
      const requestDefinition = {
        count: sinon.stub().returns(Promise.resolve()),
      };
      return entitySet.count(requestDefinition).then(() => {
        assert.ok(requestDefinition.count.called);
      });
    });
  });

  it(".keyProperties()", function () {
    entitySet.entityTypeModel.key = [
      {
        name: "KEY_NAME",
        type: defaultType,
      },
    ];
    assert.deepEqual(
      entitySet.keyProperties({
        KEY_NAME: "VALUE1",
        NON_KEY_NAME: "VALUE2",
      }),
      {
        KEY_NAME: "'VALUE1'",
      }
    );
  });

  it(".keyPredicate()", function () {
    assert.equal(
      entitySet.keyPredicate({
        KEY_NAME1: "VALUE1",
        KEY_NAME2: "VALUE2",
      }),
      "KEY_NAME1=VALUE1,KEY_NAME2=VALUE2"
    );

    assert.equal(
      entitySet.keyPredicate({
        KEY_NAME1: "'%20VALUE1'",
        KEY_NAME2: "VALUE2",
      }),
      "KEY_NAME1='%20VALUE1',KEY_NAME2=VALUE2"
    );
  });

  it(".bodyProperties()", function () {
    entitySet.entityTypeModel.properties = [
      {
        name: "KEY_NAME1",
        type: defaultType,
      },
    ];

    assert.deepEqual(
      entitySet.bodyProperties({
        KEY_NAME1: "VALUE1",
        KEY_NAME2: "VALUE2",
      }),
      {
        KEY_NAME1: "VALUE1",
      }
    );
  });

  it(".getSingleResourcePath()", function () {
    let key = [];
    let properties = {};
    sinon.stub(entitySet, "keyProperties").withArgs(key).returns(properties);
    sinon
      .stub(entitySet, "keyPredicate")
      .withArgs(properties)
      .returns("PREDICATE");

    entitySet.defaultRequest._keyValue = key;
    innerEntitySetModel.name = "NAME";

    assert.strictEqual(entitySet.getSingleResourcePath(), "NAME(PREDICATE)");
  });

  it(".bodyProperties()", function () {
    innerEntityTypeModel.properties = "PROPERTIES";

    sinon.stub(entitySet, "processProperties").returns({
      BODY_KEY: "BODY_PROPERTY",
    });
    sinon.stub(entitySet, "processNavigationProperties").returns({
      NAVIGATION_KEY: "NAVIGATION_PROPERTY",
    });
    assert.deepEqual(entitySet.bodyProperties("BODY"), {
      BODY_KEY: "BODY_PROPERTY",
      NAVIGATION_KEY: "NAVIGATION_PROPERTY",
    });
    assert.ok(entitySet.processProperties.calledWith("BODY", "PROPERTIES"));
    assert.ok(
      entitySet.processNavigationProperties.calledWith(
        "BODY",
        innerEntityTypeModel
      )
    );
  });

  it(".processProperties()", function () {
    assert.deepEqual(
      entitySet.processProperties(
        {
          KEY_NAME1: "VALUE1",
          KEY_NAME2: "VALUE2",
        },
        [
          {
            name: "KEY_NAME1",
            type: defaultType,
          },
        ]
      ),
      {
        KEY_NAME1: "VALUE1",
      }
    );
  });

  it(".processNavigationProperties()", function () {
    let entityTypeProperties = {
      navPropKey1: "NAV_PROP_1",
      navPropKey2: "NAV_PROP_2",
    };
    let entityTypeModel = {
      navigationProperties: [
        {
          name: "navPropKey1",
        },
        {
          name: "navPropKey2",
        },
      ],
    };
    sinon.stub(entitySet, "processNavigationPropertyItems");
    entitySet.processNavigationPropertyItems.onCall(0).returns({
      navPropKey1: {
        key1: "value1",
      },
    });
    entitySet.processNavigationPropertyItems.onCall(1).returns({
      navPropKey2: {
        key2: "value2",
      },
    });
    assert.deepEqual(
      entitySet.processNavigationProperties(
        entityTypeProperties,
        entityTypeModel
      ),
      {
        navPropKey1: {
          key1: "value1",
        },
        navPropKey2: {
          key2: "value2",
        },
      }
    );
    assert.ok(
      entitySet.processNavigationPropertyItems.getCall(0).calledWith(
        {
          name: "navPropKey1",
        },
        entityTypeProperties
      )
    );
    assert.ok(
      entitySet.processNavigationPropertyItems.getCall(1).calledWith(
        {
          name: "navPropKey2",
        },
        entityTypeProperties
      )
    );
  });

  describe(".processNavigationPropertyItems()", function () {
    let navigationProperty;
    let entityTypeProperties;
    beforeEach(() => {
      navigationProperty = {
        name: "navPropKey1",
        isCollection: false,
      };
      entityTypeProperties = {
        navPropKey1: "NAV_PROP_1",
      };
    });
    it("Missing entity type definition for the navigation property", function () {
      assert.throws(() => {
        entitySet.processNavigationPropertyItems(
          navigationProperty,
          entityTypeProperties
        );
      }, /End EntityType/);
    });

    it("Process navigation property with multiplicity 1:1", function () {
      navigationProperty.type = {
        elementType: {
          properties: "NAVIGATION_PROPERTIES",
        },
      };

      sinon.stub(entitySet, "processProperties").returns({
        processedProperty: "VALUE",
      });
      sinon.stub(entitySet, "processNavigationProperties").returns({
        processedNavigationProperty: "VALUE",
      });

      assert.deepEqual(
        entitySet.processNavigationPropertyItems(
          navigationProperty,
          entityTypeProperties
        ),
        {
          navPropKey1: {
            processedProperty: "VALUE",
            processedNavigationProperty: "VALUE",
          },
        }
      );
      assert.ok(
        entitySet.processProperties.calledWith(
          "NAV_PROP_1",
          "NAVIGATION_PROPERTIES"
        )
      );
      assert.ok(
        entitySet.processNavigationProperties.calledWith(
          "NAV_PROP_1",
          navigationProperty.type.elementType
        )
      );
    });
    it("Process navigation property with multiplicity 1:N", function () {
      navigationProperty.isCollection = true;
      navigationProperty.type = {
        elementType: {
          properties: "PROPERTIES",
        },
      };
      entityTypeProperties.navPropKey1 = ["NAV_PROP_1_0", "NAV_PROP_1_1"];

      sinon.stub(entitySet, "processProperties").returns({
        processedProperty: "VALUE",
      });
      sinon.stub(entitySet, "processNavigationProperties").returns({
        processedNavigationProperty: "VALUE",
      });

      assert.deepEqual(
        entitySet.processNavigationPropertyItems(
          navigationProperty,
          entityTypeProperties
        ),
        {
          navPropKey1: [
            {
              processedProperty: "VALUE",
              processedNavigationProperty: "VALUE",
            },
            {
              processedProperty: "VALUE",
              processedNavigationProperty: "VALUE",
            },
          ],
        }
      );
      assert.ok(
        entitySet.processProperties
          .getCall(0)
          .calledWith("NAV_PROP_1_0", "PROPERTIES")
      );
      assert.ok(
        entitySet.processProperties
          .getCall(1)
          .calledWith("NAV_PROP_1_1", "PROPERTIES")
      );
      assert.ok(entitySet.processProperties.calledTwice);
      assert.ok(
        entitySet.processNavigationProperties
          .getCall(0)
          .calledWith("NAV_PROP_1_0", navigationProperty.type.elementType)
      );
      assert.ok(
        entitySet.processNavigationProperties
          .getCall(1)
          .calledWith("NAV_PROP_1_1", navigationProperty.type.elementType)
      );
      assert.ok(entitySet.processNavigationProperties.calledTwice);
    });
  });

  describe("_unwrapNestedProperties()", function () {
    let response;
    let navProperty;
    let nestedNavProperty;
    let nestedNavProperties;
    let responseWithSingleNavProp;
    let responseWithNestedNavProp;
    beforeEach(function () {
      response = {
        A: "B",
      };
      navProperty = {
        results: [],
      };
      responseWithSingleNavProp = _.merge(
        {
          navProperty: navProperty,
        },
        response
      );
      /* eslint-disable camelcase */
      nestedNavProperties = {
        C: "D",
        to_Property: navProperty,
      };
      /* eslint-enable camelcase */
      nestedNavProperty = {
        results: [nestedNavProperties],
      };
      responseWithNestedNavProp = _.merge(
        {},
        {
          navProperty: nestedNavProperty,
        },
        response
      );
    });

    it("Leave response as is", function () {
      assert.strictEqual(
        entitySet._unwrapNestedProperties(undefined),
        undefined
      );
      assert.strictEqual(
        entitySet._unwrapNestedProperties("RESPONSE"),
        "RESPONSE"
      );
      assert.deepEqual(entitySet._unwrapNestedProperties({}), {});
      assert.deepEqual(entitySet._unwrapNestedProperties(response), response);
    });

    it("Check unwrapping in object response", function () {
      assert.deepEqual(
        entitySet._unwrapNestedProperties(responseWithSingleNavProp),
        _.merge(
          {
            navProperty: navProperty.results,
          },
          response
        )
      );

      /* eslint-disable camelcase */
      assert.deepEqual(
        entitySet._unwrapNestedProperties(responseWithNestedNavProp),
        _.merge(
          {},
          {
            navProperty: [
              _.merge({}, nestedNavProperties, {
                to_Property: [],
              }),
            ],
          },
          response
        )
      );
      /* eslint-enable camelcase */
    });

    it("Check unwrapping in array response", function () {
      /* eslint-disable camelcase */
      assert.deepEqual(
        [entitySet._unwrapNestedProperties(responseWithNestedNavProp)],
        [
          _.merge(
            {},
            {
              navProperty: [
                _.merge({}, nestedNavProperties, {
                  to_Property: [],
                }),
              ],
            },
            response
          ),
        ]
      );
      /* eslint-enable camelcase */
    });
  });

  describe("._handleAgentCall()", function () {
    it("Failed on request call", function () {
      let promise;
      let call = sinon.stub().returns(Promise.reject("ERROR"));
      sinon.stub(entitySet, "reset");
      sinon.stub(entitySet, "determineRequestHeaders");
      promise = entitySet._handleAgentCall(call, "REQUEST").catch((err) => {
        assert(entitySet.determineRequestHeaders.calledWith("REQUEST"));
        assert.ok(call.calledWith("REQUEST"));
        assert.strictEqual(err, "ERROR");
      });
      assert(entitySet.reset.called);
      return promise;
    });
    it("Successfully receive data", function () {
      let promise;
      let call = sinon.stub().returns(Promise.resolve("RESPONSE"));
      sinon.stub(entitySet, "reset");
      sinon.stub(entitySet, "determineRequestHeaders");
      sinon.stub(entitySet, "determineResponseResult").returns("RESULT");
      promise = entitySet._handleAgentCall(call, "REQUEST").then((result) => {
        assert(entitySet.determineRequestHeaders.calledWith("REQUEST"));
        assert(
          entitySet.determineResponseResult.calledWith("REQUEST", "RESPONSE")
        );
        assert.strictEqual(result, "RESULT");
        assert.ok(call.calledWith("REQUEST"));
      });
      assert(entitySet.reset.called);
      return promise;
    });
  });

  describe(".determineRequestHeaders()", function () {
    let request;

    beforeEach(function () {
      request = {
        _resource: {
          entityTypeModel: {},
        },
        header: sinon.stub(),
      };
    });
    it("Headers for standard odata request request", function () {
      entitySet.determineRequestHeaders(request);
      assert.ok(request.header.calledWithExactly("Accept", "application/json"));
    });

    it("Headers for stream request", function () {
      request._isValue = true;
      entitySet.determineRequestHeaders(request);
      assert.ok(request.header.notCalled);
    });

    it("Headers for count request", function () {
      request._isCount = true;
      request._resource.entityTypeModel.hasStream = false;
      entitySet.determineRequestHeaders(request);
      assert.ok(request.header.notCalled);
    });
  });

  describe(".determineResponseResult()", function () {
    let request;
    let response;

    beforeEach(function () {
      request = {
        _resource: {
          entityTypeModel: {},
        },
        header: sinon.stub(),
      };
      response = {
        arrayBuffer: sinon.stub().returns(Promise.resolve([])),
        json: sinon.stub().returns(
          Promise.resolve({
            body: "BODY",
          })
        ),
        text: sinon.stub().returns(Promise.resolve("PROPERTY_VALUE")),
      };
      sinon
        .stub(entitySet, "_unwrapNestedProperties")
        .returns("UNWRAPPED_RESULT");
      innerAgent.getResultPath = sinon.stub().returns("body");
    });

    it("response for entity with binary data", function () {
      request._resource.entityTypeModel.hasStream = true;
      sandbox
        .stub(responseType, "determine")
        .returns(responseType.ENTITY_VALUE);
      return entitySet
        .determineResponseResult(request, response)
        .then((buf) => {
          assert.ok(buf instanceof Buffer);
        });
    });

    it("response for raw property ", function () {
      sandbox
        .stub(responseType, "determine")
        .returns(responseType.PROPERTY_VALUE);
      return entitySet
        .determineResponseResult(request, response)
        .then((result) => {
          assert.equal(result, "PROPERTY_VALUE");
        });
    });

    it("raw response", function () {
      request._isRaw = true;
      return entitySet
        .determineResponseResult(request, response)
        .then((result) => {
          assert.strictEqual(result, response);
        });
    });

    it("JSON response with result path", function () {
      innerAgent.getResultPath = sinon.stub().returns("body");
      request._isList = "IS_LIST";

      return entitySet
        .determineResponseResult(request, response)
        .then((json) => {
          assert.strictEqual(json, "UNWRAPPED_RESULT");
          assert.ok(
            innerAgent.getResultPath.calledWithExactly("IS_LIST", {
              body: "BODY",
            })
          );
          assert.ok(
            entitySet._unwrapNestedProperties.calledWithExactly("BODY")
          );
        });
    });

    it("JSON response without result path", function () {
      innerAgent.getResultPath.returns("");
      request._isList = "IS_LIST";

      return entitySet
        .determineResponseResult(request, response)
        .then((json) => {
          assert.strictEqual(json, "UNWRAPPED_RESULT");
          assert.ok(
            innerAgent.getResultPath.calledWithExactly("IS_LIST", {
              body: "BODY",
            })
          );
          assert.ok(
            entitySet._unwrapNestedProperties.calledWithExactly({
              body: "BODY",
            })
          );
        });
    });

    it("non-content response", function () {
      innerAgent.getResultPath.returns("");
      request._isList = "IS_LIST";
      response.status = 204;

      return entitySet
        .determineResponseResult(request, response)
        .then((json) => {
          assert.equal(json, null);
        });
    });
    it("Return body from response with binary data", function () {
      request._isCount = true;
      response.text = sinon.stub().returns(Promise.resolve("RECEIVED_COUNT"));
      sandbox.stub(parsers, "count").returns("PARSED_COUNT");
      return entitySet
        .determineResponseResult(request, response)
        .then((res) => {
          assert.ok(parsers.count.calledWithExactly("RECEIVED_COUNT"));
          assert.equal(res, "PARSED_COUNT");
        });
    });
  });
});
