"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const _ = require("lodash");

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
    innerAgent = {
      fetchToken: async () => "token",
    };
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

  describe("#constructor()", function () {
    it("Properties are initialized", function () {
      assert.deepEqual(entitySet.agent, innerAgent);
      assert.deepEqual(entitySet.entitySetModel, innerEntitySetModel);
      assert.deepEqual(entitySet.entityTypeModel, innerEntityTypeModel);
      assert.ok(entitySet.reset instanceof Function);
      assert.deepEqual(entitySet.defaultRequest, entitySet._defaults);
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
    it("Pass one property nameso select clause", function () {
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
    it("Correctli encode property names", function () {
      innerEntityTypeModel.properties = {
        $Property_1: {
          Name: "$Property_1",
        },
        $Property_2: {
          Name: "$Property_2",
        },
      };
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
      sinon.stub(entitySet.defaultRequest, "key").withArgs("A").returns("X");
      assert.strictEqual(entitySet.key("A"), "X");
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
      sinon.stub(entitySet, "reset");
      sinon.stub(entitySet, "bodyProperties").returns("BODY_PROPERTIES");
      innerEntityTypeModel.key = [
        {
          name: "keyParameter",
          type: defaultType,
        },
      ];
      innerAgent.fetchToken = sinon.stub().returns(Promise.resolve("TOKEN"));
      innerAgent.getResultPath = sinon.stub().returns("body.d");
      innerAgent.post = sinon.stub().returns({
        body: {
          d: "RESPONSE",
        },
      });
      request = entitySet.defaultRequest;
      sinon.stub(request, "header");
      sinon.stub(request, "payload");
      request._headers = {};
      request._isRaw = false;
      innerEntitySetModel.name = "ENTITY_SET_NAME";
      innerAgent.batchManager = {};
    });
    it("Successfully creates entity and return parsed data", function () {
      request._payload = "BODY_PROPERTIES";
      return entitySet.post(body).then((res) => {
        assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
        assert.ok(request.header.calledWith("x-csrf-token", "TOKEN"));
        assert.ok(
          request.header.calledWith("Content-type", "application/json")
        );
        assert.ok(request.header.calledWith("Accept", "application/json"));
        assert.ok(entitySet.reset.called);
        assert.deepEqual(res, "RESPONSE");
        assert.ok(
          innerAgent.post.calledWith(
            "/ENTITY_SET_NAME?",
            request._headers,
            "BODY_PROPERTIES"
          )
        );
      });
    });
    it("Successfully creates entity and return raw data", function () {
      return entitySet
        .raw(true)
        .post(body)
        .then((res) => {
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
      return entitySet
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
      return entitySet
        .raw(true)
        .post(body)
        .catch((err) => {
          assert.ok(request.header.called);
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
      assert.ok(
        post.calledWithExactly(
          "/ENTITY_SET_NAME?",
          request._headers,
          "BODY_PROPERTIES",
          "DEFAULT_CHANGESET"
        )
      );
      assert.ok(request.header.calledWithExactly("Accept", "application/json"));
      assert.strictEqual(
        entitySet._handleBatchCall.getCall(0).args[1],
        innerAgent.batchManager.defaultBatch
      );
    });
  });

  describe(".put()", function () {
    let body = {
      keyParameter: "keyValue",
      parameter: "value",
    };
    let req;
    this.beforeEach(() => {
      sinon.stub(entitySet, "reset");
      sinon.stub(entitySet, "keyProperties").returns("KEY_PROPERTIES");
      sinon.stub(entitySet, "keyPredicate").returns("KEY_PREDICATE");
      sinon.stub(entitySet, "bodyProperties").returns("BODY_PROPERTIES");
      innerEntityTypeModel.key = [
        {
          name: "keyParameter",
          type: defaultType,
        },
      ];

      req = entitySet.defaultRequest;
      sinon.stub(req, "header");
      sinon.stub(req, "payload");
      req._headers = {};
      req._isRaw = false;
      innerEntitySetModel.name = "ENTITY_SET_NAME";

      innerAgent.fetchToken = sinon.stub().returns(Promise.resolve("TOKEN"));
      innerAgent.getResultPath = sinon.stub().returns("body.d");
      innerAgent.batchManager = {};
    });

    it("Successfully updates an entry by overwriting data", function () {
      innerAgent.put = sinon.stub().returns(
        Promise.resolve({
          ok: true,
        })
      );
      req._payload = "BODY_PROPERTIES";

      return entitySet.put(body).then((res) => {
        assert.ok(req.payload.calledWithExactly("BODY_PROPERTIES"));
        assert.strictEqual(res, true);
        assert(req.header.calledWith("x-csrf-token", "TOKEN"));
        assert(req.header.calledWith("Content-type", "application/json"));
        assert(req.header.calledWith("Accept", "application/json"));
        assert(entitySet.reset.called);
        assert(
          innerAgent.put.calledWith(
            "/ENTITY_SET_NAME(KEY_PREDICATE)",
            req._headers,
            "BODY_PROPERTIES"
          )
        );
      });
    });

    it("Successfully updates in raw mode", function () {
      let resp = {
        ok: true,
      };

      innerAgent.put = sinon.stub().returns(Promise.resolve(resp));
      entitySet.raw();
      req._payload = "BODY_PROPERTIES";

      return entitySet.put(body).then((res) => {
        assert.ok(req.payload.calledWithExactly("BODY_PROPERTIES"));
        assert.strictEqual(res, resp);
        assert(req.header.calledWith("x-csrf-token", "TOKEN"));
        assert(req.header.calledWith("Content-type", "application/json"));
        assert(req.header.calledWith("Accept", "application/json"));
        assert(entitySet.reset.called);
        assert(
          innerAgent.put.calledWith(
            "/ENTITY_SET_NAME(KEY_PREDICATE)",
            req._headers,
            "BODY_PROPERTIES"
          )
        );
      });
    });

    it("handes invalid response", function () {
      innerAgent.put = sinon.stub().returns(Promise.reject(new Error("ERROR")));
      return entitySet.put(body).catch((err) => {
        assert(err instanceof Error);
        assert(entitySet.reset.called);
      });
    });

    it("Successfully update entity and return parsed data inside batch", function () {
      let cb;
      let put = sinon.stub();
      innerAgent.batchManager = {
        defaultBatch: {
          put: put,
        },
        defaultChangeSet: "DEFAULT_CHANGESET",
      };
      sinon.stub(entitySet, "_handleBatchCall").returns("PROMISE");
      req._payload = "BODY_PROPERTIES";

      assert.ok(entitySet.put(body), "PROMISE");

      cb = entitySet._handleBatchCall.getCall(0).args[0];
      cb();

      assert.ok(req.payload.calledWithExactly("BODY_PROPERTIES"));
      assert.ok(
        put.calledWithExactly(
          "/ENTITY_SET_NAME(KEY_PREDICATE)",
          req._headers,
          "BODY_PROPERTIES",
          "DEFAULT_CHANGESET"
        )
      );
      assert.ok(req.header.calledWithExactly("Accept", "application/json"));
      assert.strictEqual(
        entitySet._handleBatchCall.getCall(0).args[1],
        innerAgent.batchManager.defaultBatch
      );
    });
  });

  describe(".merge()", function () {
    let newData;
    let request;
    beforeEach(() => {
      newData = {
        parameter: "value",
      };
      sinon.stub(entitySet, "bodyProperties").returns("BODY_PROPERTIES");
      sinon.stub(entitySet, "reset");
      innerEntityTypeModel.key = [
        {
          name: "keyParameter",
          type: defaultType,
        },
      ];
      innerAgent.fetchToken = sinon.stub().returns(Promise.resolve("TOKEN"));
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
      return entitySet.merge(body).then((res) => {
        assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
        assert(request.header.calledWith("x-csrf-token", "TOKEN"));
        assert(request.header.calledWith("Content-type", "application/json"));
        assert(request.header.calledWith("Accept", "application/json"));
        assert(entitySet.reset.called);
        assert.deepEqual(innerAgent.merge.getCall(0).args, [
          "/ENTITY_SET_NAME(keyParameter='keyValue')",
          request._headers,
          "BODY_PROPERTIES",
        ]);
        assert(entitySet.bodyProperties.calledWith(newData));
        assert.deepEqual(res, response);
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

      return entitySet.merge(body).then((res) => {
        assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
        assert(request.header.calledWith("x-csrf-token", "TOKEN"));
        assert(request.header.calledWith("Content-type", "application/json"));
        assert(request.header.calledWith("Accept", "application/json"));
        assert(entitySet.reset.called);
        assert.deepEqual(res, {
          ok: true,
        });
        assert.deepEqual(innerAgent.merge.getCall(0).args, [
          "/ENTITY_SET_NAME(keyParameter='keyValue')",
          request._headers,
          "BODY_PROPERTIES",
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
      innerAgent.merge = sinon
        .stub()
        .returns(Promise.reject(new Error("ERROR")));
      request._payload = "BODY_PROPERTIES";
      return entitySet.merge(body).catch((err) => {
        assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
        assert(err instanceof Error);
        assert(request.header.calledWith("x-csrf-token", "TOKEN"));
        assert(request.header.calledWith("Content-type", "application/json"));
        assert(request.header.calledWith("Accept", "application/json"));
        assert(entitySet.reset.called);
        assert.deepEqual(innerAgent.merge.getCall(0).args, [
          "/ENTITY_SET_NAME(keyParameter='keyValue')",
          request._headers,
          "BODY_PROPERTIES",
        ]);
      });
    });
    it("Failed fetching of a token", function () {
      innerAgent.fetchToken.returns(Promise.reject(new Error("ERROR")));

      return entitySet.merge("BODY").catch((err) => {
        assert.ok(err instanceof Error);
        assert.ok(request.header.notCalled);
        assert.ok(request.header.notCalled);
        assert.ok(request.header.notCalled);
        assert.ok(entitySet.reset.called);
        assert.ok(innerAgent.merge.notCalled);
      });
    });
    it("Call merge without parameters raises error", function () {
      assert.throws(() => {
        entitySet.merge();
      });
    });
    it("Call merge with too parameters raises error", function () {
      assert.throws(() => {
        entitySet.merge(1, 2, 3);
      });
    });
    it("Successfully updates an entry by overwriting data", function () {
      let entityKey = {
        keyParameter: "keyValue",
      };
      request._payload = "BODY_PROPERTIES";
      return entitySet.merge(entityKey, newData).then((res) => {
        assert(entitySet.reset.called);
        assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
        assert.strictEqual(res, true);
        assert.deepEqual(innerAgent.merge.getCall(0).args, [
          "/ENTITY_SET_NAME(keyParameter='keyValue')",
          request._headers,
          "BODY_PROPERTIES",
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

      return entitySet.merge(entityKey, newData).then((res) => {
        assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
        assert(entitySet.reset.called);
        assert.strictEqual(res, true);
        assert.deepEqual(innerAgent.merge.getCall(0).args, [
          "/ENTITY_SET_NAME(keyParameter='keyValue')",
          request._headers,
          "BODY_PROPERTIES",
        ]);
        assert(entitySet.bodyProperties.calledWith(newData));
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

      assert.ok(entitySet.merge(body), "PROMISE");

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

  describe(".delete()", function () {
    let properties = {
      DraftUUID: "guid'aaaa-bbbb-cccc'",
    };
    let response = {
      ok: true,
    };
    let request;
    beforeEach(() => {
      sinon.stub(entitySet, "keyProperties").returns("KEY_PROPERTIES");
      sinon.stub(entitySet, "keyPredicate").returns("KEY_PREDICATE");
      sinon.stub(entitySet, "reset");
      innerAgent.fetchToken = sinon.stub().returns(Promise.resolve("TOKEN"));
      innerAgent.getResultPath = sinon.stub().returns("body.d");
      innerAgent.delete = sinon.stub().returns(Promise.resolve(response));
      request = entitySet.defaultRequest;
      sinon.stub(request, "header");
      request._headers = {};
      request._isRaw = false;
      innerEntitySetModel.name = "ENTITY_SET_NAME";
      innerAgent.batchManager = {};
    });
    it("Successfully deletes an entry", function () {
      response = {};
      innerAgent.delete = sinon.stub().returns(
        Promise.resolve({
          body: {
            d: response,
          },
        })
      );

      return entitySet.delete(properties).then((res) => {
        assert(request.header.calledWith("x-csrf-token", "TOKEN"));
        assert(request.header.calledWith("Accept", "application/json"));
        assert(request.header.calledWith("If-Match", "*"));
        assert(entitySet.reset.called);
        assert.deepEqual(res, response);
        assert(
          innerAgent.delete.calledWith(
            "/ENTITY_SET_NAME(KEY_PREDICATE)",
            request._headers
          )
        );
      });
    });
    it("Successfully deletes an entry entity in raw format", function () {
      entitySet.raw();
      entitySet.key(properties);
      return entitySet.delete().then((res) => {
        assert(request.header.calledWith("x-csrf-token", "TOKEN"));
        assert(request.header.calledWith("Accept", "application/json"));
        assert(request.header.calledWith("If-Match", "*"));
        assert(entitySet.reset.called);
        assert.strictEqual(res, response);
        assert(
          innerAgent.delete.calledWith(
            "/ENTITY_SET_NAME(KEY_PREDICATE)",
            request._headers
          )
        );
      });
    });
    it("Invalid response", function () {
      innerAgent.delete.returns(Promise.reject(new Error("ERROR")));
      return entitySet.delete(properties).catch((err) => {
        assert(err instanceof Error);
        assert(request.header.calledWith("x-csrf-token", "TOKEN"));
        assert(request.header.calledWith("Accept", "application/json"));
        assert(request.header.calledWith("If-Match", "*"));
        assert(entitySet.reset.called);
        assert(
          innerAgent.delete.calledWith(
            "/ENTITY_SET_NAME(KEY_PREDICATE)",
            request._headers
          )
        );
      });
    });
    it("Failed fetching of a token", function () {
      innerAgent.fetchToken.returns(Promise.reject(new Error("ERROR")));
      return entitySet.delete(properties).catch((err) => {
        assert(err instanceof Error);
        assert(request.header.notCalled);
        assert(entitySet.reset.called);
        assert(innerAgent.delete.notCalled);
      });
    });
    it("Successfully delete entity", function () {
      let cb;
      let deleteMethod = sinon.stub();

      innerAgent.batchManager = {
        defaultBatch: {
          delete: deleteMethod,
        },
        defaultChangeSet: "DEFAULT_CHANGESET",
      };
      sinon.stub(entitySet, "_handleBatchCall").returns("PROMISE");

      assert.ok(entitySet.delete(properties), "PROMISE");

      cb = entitySet._handleBatchCall.getCall(0).args[0];
      cb();

      assert.ok(
        deleteMethod.calledWithExactly(
          "/ENTITY_SET_NAME(KEY_PREDICATE)",
          request._headers,
          "DEFAULT_CHANGESET"
        )
      );
      assert.ok(request.header.calledWithExactly("If-Match", "*"));
    });
  });

  describe(".raw()", function () {
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
    let resultData = {
      a: {
        b: {
          c: {
            KEY: "VALUE",
          },
        },
      },
    };
    beforeEach(() => {
      entitySet.reset();
      sinon.stub(entitySet, "reset");
      innerAgent.get = sinon.stub().returns(Promise.resolve(resultData));
      innerAgent.getResultPath = sinon.stub().returns("a.b.c");
      innerEntitySetModel.name = "ENTITY_SET_NAME";
      innerAgent.batchManager = {};
    });

    it("Successfully gets entity", function () {
      let request = entitySet.request();

      request._path = "PATH";
      request._headers = {};
      request._resource.entityTypeModel.hasStream = "HAS_STREAM";
      sinon.stub(entitySet, "_handleAgentCall").returns(Promise.resolve());

      return entitySet.executeGet(request).then(() => {
        entitySet._handleAgentCall.getCall(0).args[0]();
        assert(entitySet._handleAgentCall.getCall(0).args[1] === request);
        assert.deepEqual(innerAgent.get.getCall(0).args, [
          "PATH",
          request._headers,
          undefined,
          "HAS_STREAM",
        ]);
      });
    });

    it("Successfully gets entity in raw", function () {
      let request = entitySet.request();
      request._isRaw = true;
      sinon.stub(request, "header");
      return entitySet.executeGet(request).then((res) => {
        assert(request.header.calledWith("Accept", "application/json"));
        assert(entitySet.reset.called);
        assert.deepEqual(res, resultData);
      });
    });

    it("Successfully received data in invalid", function () {
      let request = entitySet.request();
      sinon.stub(request, "header");

      innerAgent.get.returns(Promise.resolve({}));
      return entitySet.executeGet(request).then((res) => {
        assert(request.header.calledWith("Accept", "application/json"));
        assert(entitySet.reset.called);
        assert.strictEqual(res, undefined);
      });
    });

    it("Invalid response", function () {
      innerAgent.get.returns(Promise.reject(new Error("ERROR")));
      let request = entitySet.request();
      sinon.stub(request, "header");
      return entitySet.executeGet(request).catch((err) => {
        assert(_.isError(err));
        assert(request.header.calledWith("Accept", "application/json"));
        assert(entitySet.reset.called);
      });
    });

    it("Successfully get entity in batch", function () {
      let cb;
      let getMethod = sinon.stub();
      let request = entitySet.request();

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

      assert.ok(entitySet.executeGet(request), "PROMISE");

      cb = entitySet._handleBatchCall.getCall(0).args[0];
      cb();

      assert.ok(request.calculatePath.called);
      assert.ok(
        getMethod.calledWithExactly(
          "PATH",
          request._headers,
          "DEFAULT_CHANGESET"
        )
      );
      assert.ok(request.header.calledWith("Accept", "application/json"));
    });
  });

  describe(".count()", function () {
    let request;
    beforeEach(() => {
      sinon.stub(entitySet, "reset");
      innerAgent.get = sinon.stub().returns(
        Promise.resolve({
          body: "5",
        })
      );
      request = entitySet.defaultRequest;
      request._headers = {};
      request._isRaw = false;
      innerEntitySetModel.name = "ENTITY_SET_NAME";
      innerEntitySetModel.sap.countable = true;
    });
    it("Successfully count of EntitySet", function () {
      return entitySet.count().then((res) => {
        assert(entitySet.reset.called);
        assert.strictEqual(res, 5);
        assert(
          innerAgent.get.calledWithExactly(
            "/ENTITY_SET_NAME/$count",
            request._headers
          )
        );
      });
    });
    it("Successfully raw count of EntitySet ", function () {
      entitySet.raw();
      return entitySet.count().then((res) => {
        assert(entitySet.reset.called);
        assert.deepEqual(res, {
          body: "5",
        });
        assert(
          innerAgent.get.calledWithExactly(
            "/ENTITY_SET_NAME/$count",
            request._headers
          )
        );
      });
    });
    it("Reject on not counteable entity set", function () {
      innerEntitySetModel.sap.countable = false;
      return entitySet.count().catch((err) => {
        assert.ok(err.message.match(/not countable/));
        assert.ok(innerAgent.get.notCalled);
      });
    });
    it("Reject invalid response (response is not number)", function () {
      innerAgent.get.returns(
        Promise.resolve({
          body: "",
        })
      );
      return entitySet.count().catch((err) => {
        assert.ok(err.message.match(/invalid count/));
        assert(entitySet.reset.called);
        assert(
          innerAgent.get.calledWithExactly(
            "/ENTITY_SET_NAME/$count",
            request._headers
          )
        );
      });
    });
    it("Reject by HTTP error", function () {
      innerAgent.get.returns(Promise.reject(new Error("ERROR")));
      return entitySet.count().catch((err) => {
        assert(_.isError(err));
        assert(entitySet.reset.called);
        assert(
          innerAgent.get.calledWithExactly(
            "/ENTITY_SET_NAME/$count",
            request._headers
          )
        );
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
    it("Missing entity type definition for the navigation property", function () {
      let navigationProperty = {
        name: "navPropKey1",
      };
      let entityTypeProperties = {
        navPropKey1: "NAV_PROP_1",
      };
      let entityTypeModel = {
        navigationPropertyAssociationTo: sinon.stub(),
      };
      innerMetadata.model = "MODEL";
      assert.throws(() => {
        entitySet.processNavigationPropertyItems(
          navigationProperty,
          entityTypeProperties,
          entityTypeModel
        );
      }, /End EntityType/);
      assert.ok(
        entityTypeModel.navigationPropertyAssociationTo.calledWith(
          "MODEL",
          "navPropKey1"
        )
      );
    });
    it("Process navigation property with multiplicity 1:1", function () {
      let navigationProperty = {
        name: "navPropKey1",
      };
      let entityTypeProperties = {
        navPropKey1: "NAV_PROP_1",
      };
      let assoociationEnd = {
        multiplicity: "1",
        type: {
          properties: "NAVIGATION_PROPERTIES",
        },
      };
      let entityTypeModel = {
        navigationPropertyAssociationTo: sinon.stub().returns(assoociationEnd),
      };

      innerMetadata.model = "MODEL";
      sinon.stub(entitySet, "processProperties").returns({
        processedProperty: "VALUE",
      });
      sinon.stub(entitySet, "processNavigationProperties").returns({
        processedNavigationProperty: "VALUE",
      });

      assert.deepEqual(
        entitySet.processNavigationPropertyItems(
          navigationProperty,
          entityTypeProperties,
          entityTypeModel
        ),
        {
          processedProperty: "VALUE",
          processedNavigationProperty: "VALUE",
        }
      );
      assert.ok(
        entityTypeModel.navigationPropertyAssociationTo.calledWith(
          "MODEL",
          "navPropKey1"
        )
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
          assoociationEnd.type
        )
      );
    });
    it("Process navigation property with multiplicity 1:N", function () {
      let navigationProperty = {
        name: "navPropKey1",
      };
      let entityTypeProperties = {
        navPropKey1: ["NAV_PROP_1_0", "NAV_PROP_1_1"],
      };
      let assoociationEnd = {
        multiplicity: "*",
        type: {
          properties: "PROPERTIES",
        },
      };
      let entityTypeModel = {
        navigationPropertyAssociationTo: sinon.stub().returns(assoociationEnd),
      };

      innerMetadata.model = "MODEL";
      sinon.stub(entitySet, "processProperties").returns({
        processedProperty: "VALUE",
      });
      sinon.stub(entitySet, "processNavigationProperties").returns({
        processedNavigationProperty: "VALUE",
      });

      assert.deepEqual(
        entitySet.processNavigationPropertyItems(
          navigationProperty,
          entityTypeProperties,
          entityTypeModel
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
        entityTypeModel.navigationPropertyAssociationTo.calledWith(
          "MODEL",
          "navPropKey1"
        )
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
          .calledWith("NAV_PROP_1_0", assoociationEnd.type)
      );
      assert.ok(
        entitySet.processNavigationProperties
          .getCall(1)
          .calledWith("NAV_PROP_1_1", assoociationEnd.type)
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
      nestedNavProperties = {
        C: "D",
        to_Property: navProperty,
      };
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
    });

    it("Check unwrapping in array response", function () {
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
    });
  });

  describe("._handleBatchCall()", function () {
    it("Create request in existing batch", function () {
      let callback = sinon.stub().returns({
        promise: "PROMISE",
      });
      innerAgent.batchManager = {
        has: sinon.stub().returns(true),
      };
      sinon.stub(entitySet, "reset");

      assert.strictEqual(
        entitySet._handleBatchCall(callback, "BATCH_OBJECT"),
        "PROMISE"
      );
      assert.ok(entitySet.reset.called);
      assert.ok(innerAgent.batchManager.has.calledWith("BATCH_OBJECT"));
    });
    it("Failed on unmanaged batch", function () {
      let callback = sinon.stub().returns({
        promise: "PROMISE",
      });
      innerAgent.batchManager = {
        has: sinon.stub().returns(false),
      };

      return entitySet
        ._handleBatchCall(callback, "BATCH_OBJECT")
        .catch((err) => {
          assert.ok(err instanceof Error);
        });
    });
  });

  describe("._handleAgentCall()", function () {
    it("Failed on token fetching", function () {
      let call = sinon.stub();
      innerAgent.fetchToken = sinon.stub().returns(Promise.reject("ERROR"));
      sinon.stub(entitySet, "reset");
      return entitySet._handleAgentCall(call).catch((err) => {
        assert.strictEqual(err, "ERROR");
        assert(entitySet.reset.called);
      });
    });
    it("Failed on request call", function () {
      let call = sinon.stub().returns(Promise.reject("ERROR"));
      innerAgent.fetchToken = sinon.stub().returns(Promise.resolve("TOKEN"));
      sinon.stub(entitySet, "reset");
      sinon.stub(entitySet, "determineRequestHeaders");
      return entitySet._handleAgentCall(call, "REQUEST").catch((err) => {
        assert(
          entitySet.determineRequestHeaders.calledWith("REQUEST", "TOKEN")
        );
        assert.strictEqual(err, "ERROR");
        assert(entitySet.reset.called);
      });
    });
    it("Successfully reeive data", function () {
      let call = sinon.stub().returns(Promise.resolve("RESPONSE"));
      innerAgent.fetchToken = sinon.stub().returns(Promise.resolve("TOKEN"));
      sinon.stub(entitySet, "reset");
      sinon.stub(entitySet, "determineRequestHeaders");
      sinon.stub(entitySet, "determineResponseResult").returns("RESULT");
      return entitySet._handleAgentCall(call, "REQUEST").then((result) => {
        assert(
          entitySet.determineRequestHeaders.calledWith("REQUEST", "TOKEN")
        );
        assert(
          entitySet.determineResponseResult.calledWith("REQUEST", "RESPONSE")
        );
        assert(entitySet.reset.called);
        assert.strictEqual(result, "RESULT");
      });
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
    it("Headers for standard OData request", function () {
      request._resource.entityTypeModel.hasStream = false;
      entitySet.determineRequestHeaders(request, "TOKEN");
      assert.deepEqual(request.header.getCall(0).args, [
        "x-csrf-token",
        "TOKEN",
      ]);
      assert.deepEqual(request.header.getCall(1).args, [
        "Accept",
        "application/json",
      ]);
    });

    it("Headers for streamrequest", function () {
      request._resource.entityTypeModel.hasStream = true;
      entitySet.determineRequestHeaders(request, "TOKEN");
      assert.deepEqual(request.header.getCall(0).args, [
        "x-csrf-token",
        "TOKEN",
      ]);
      assert.ok(request.header.calledOnce);
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
      response = {};
    });

    it("Return body from response with binary data", function () {
      request._resource.entityTypeModel.hasStream = true;
      response.body = "BODY";
      assert.strictEqual(
        entitySet.determineResponseResult(request, response),
        "BODY"
      );
    });

    it("raw response", function () {
      request._isRaw = true;
      assert.strictEqual(
        entitySet.determineResponseResult(request, response),
        response
      );
    });

    it("JSON response", function () {
      innerAgent.getResultPath = sinon.stub().returns("body");
      sinon.stub(entitySet, "_unwrapNestedProperties").returns("RESULT");
      response.body = "BODY";
      request._isList = "IS_LIST";

      assert.strictEqual(
        entitySet.determineResponseResult(request, response),
        "RESULT"
      );
      assert.ok(innerAgent.getResultPath.calledWithExactly("IS_LIST"));
      assert.ok(entitySet._unwrapNestedProperties.calledWithExactly("BODY"));
    });
  });

  it(".parseCount()", function () {
    assert.strictEqual(
      entitySet.parseCount({
        body: "10",
      }),
      10
    );
    assert.strictEqual(
      entitySet.parseCount({
        body: 10,
      }),
      10
    );
    assert.strictEqual(
      entitySet.parseCount({
        body: {},
        res: {
          text: "10",
        },
      }),
      10
    );
    assert.strictEqual(
      entitySet.parseCount({
        body: {},
      }),
      NaN
    );
  });
});
