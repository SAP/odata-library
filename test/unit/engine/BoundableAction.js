"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("engine/BoundableAction", function () {
  var Action;
  var action;
  var actionProperties;
  var actionModel;
  var innerAgent;

  beforeEach(function () {
    innerAgent = {};
    actionProperties = {};
    actionModel = {
      getParameter: () => ({
        type: {
          format: (x) => x,
        },
      }),
      getLegacyApiObject: () => actionProperties,
      name: "an",
      schema: {
        namespace: "ns",
      },
    };

    Action = proxyquire("../../../lib/engine/BoundableAction", {});
    action = new Action(innerAgent, actionModel);
  });

  it("#constructor()", function () {
    assert.deepEqual(action.agent, innerAgent);
    assert.deepEqual(action.meta, actionModel);
    assert.deepEqual(action.defaultRequest, action._defaults);
  });

  it(".createDirectCaller()", function () {
    const entity = {};
    const actionImport = {};

    sinon.stub(action, "call");
    const directCaller = action.createDirectCaller(entity, actionImport);

    directCaller("ARGUMENTS");

    assert.ok(action.call.calledWith(entity, actionImport, "ARGUMENTS"));
  });

  it(".call()", function () {
    sinon.stub(action, "parameter");
    sinon.stub(action, "httpMethod").returns("post");
    sinon.stub(action, "post").returns("PROMISE");

    assert.equal(action.call(), "PROMISE");
    assert.ok(action.parameter.notCalled);
    assert.ok(action.httpMethod.called);
    assert.ok(action.post.called);
  });

  it(".getParameterDefinition()", function () {
    action.meta.parameters = [
      {},
      {
        name: "param",
      },
    ];

    assert.equal(
      action.getParameterDefinition("param"),
      action.meta.parameters[1]
    );
  });

  it(".httpMethod()", function () {
    action.meta.httpMethod = "POST";
    assert.equal(action.httpMethod(), "post");
    delete action.meta.httpMethod;
    assert.equal(action.httpMethod(), "post");
  });

  describe(".post()", function () {
    describe("use batch", function () {
      beforeEach(() => {
        sinon.stub(action, "header");
        sinon.stub(action, "reset");
        sinon
          .stub(action, "normalizeResponse")
          .returns(Promise.resolve("NORMALIZED_RESPONSE_CONTENT"));
        sinon
          .stub(action, "_handleBatchCall")
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        innerAgent.batchManager = {
          defaultBatch: {
            post: sinon.stub(),
          },
          defaultChangeSet: "DEFAULT_CHANGESET",
        };
      });
      it("Success send request and receive response content", function () {
        let promise;
        action.defaultRequest._headers = "HEADERS";
        action.meta.name = "ACTION_NAME";

        promise = action.post();

        assert.strictEqual(
          action._handleBatchCall.getCall(0).args[1],
          innerAgent.batchManager.defaultBatch
        );

        action._handleBatchCall.getCall(0).args[0]();
        assert.ok(
          innerAgent.batchManager.defaultBatch.post.calledWith(
            "/ACTION_NAME",
            "HEADERS",
            undefined,
            "DEFAULT_CHANGESET"
          )
        );
        assert.ok(action.reset.called);
        return promise.then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(action.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
          assert.ok(
            action.header.getCall(0).calledWith("Accept", "application/json")
          );
          assert.ok(action.header.calledOnce);
        });
      });
      it("Success send request and receive raw response", function () {
        let promise;
        action.defaultRequest._headers = "HEADERS";
        action.defaultRequest._isRaw = true;
        action.meta.name = "ACTION_NAME";

        promise = action.post();

        assert.strictEqual(
          action._handleBatchCall.getCall(0).args[1],
          innerAgent.batchManager.defaultBatch
        );

        action._handleBatchCall.getCall(0).args[0]();

        assert.ok(
          innerAgent.batchManager.defaultBatch.post.calledWith(
            "/ACTION_NAME",
            "HEADERS",
            undefined,
            "DEFAULT_CHANGESET"
          )
        );

        return promise.then((res) => {
          assert.ok(
            action.header.getCall(0).calledWith("Accept", "application/json")
          );
          assert.ok(action.reset.called);
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(action.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            true,
          ]);
        });
      });
      it("Success send request and receive response content with array", function () {
        let promise;

        action._handleBatchCall.returns(Promise.resolve("RESPONSE_CONTENT"));
        action.defaultRequest._headers = "HEADERS";
        action.meta.name = "ACTION_NAME";

        promise = action.post();

        assert.strictEqual(
          action._handleBatchCall.getCall(0).args[1],
          innerAgent.batchManager.defaultBatch
        );

        action._handleBatchCall.getCall(0).args[0]();
        assert.ok(
          innerAgent.batchManager.defaultBatch.post.calledWith(
            "/ACTION_NAME",
            "HEADERS",
            undefined,
            "DEFAULT_CHANGESET"
          )
        );

        return promise.then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(action.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
          assert.ok(
            action.header.getCall(0).calledWith("Accept", "application/json")
          );
          assert.ok(action.reset.called);
        });
      });
    });

    describe("direct call", function () {
      let request;

      beforeEach(() => {
        sinon.stub(action, "reset");
        sinon
          .stub(action, "normalizeResponse")
          .returns(Promise.resolve("NORMALIZED_RESPONSE_CONTENT"));
        sinon
          .stub(action, "_handleBatchCall")
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        innerAgent.batchManager = {};
        request = {
          header: sinon.stub(),
          _headers: "HEADERS",
          _isRaw: false,
        };
        Object.defineProperty(action, "defaultRequest", {
          get: sinon.stub().returns(request),
        });
      });
      it("Success send request and receive response content", function () {
        const entity = {
          reset: sinon.stub(),
        };
        innerAgent.post = sinon
          .stub()
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        action.defaultRequest._headers = "HEADERS";
        action.meta.name = "ACTION_NAME";
        sinon.stub(action, "getPayload").returns({ a: 1, c: 4 });
        sinon.stub(action, "getPath").returns("path");

        return action.post(entity).then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(action.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
          assert.ok(
            request.header
              .getCall(0)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(1).calledWith("Accept", "application/json")
          );
          assert.ok(action.reset.called);
          assert.ok(
            innerAgent.post.calledWith("path", "HEADERS", '{"a":1,"c":4}')
          );
          assert.ok(action.getPath.called);
          assert.ok(entity.reset.called);
        });
      });
      it("Success send request and receive raw response", function () {
        innerAgent.post = sinon
          .stub()
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        request._isRaw = true;
        action.meta.name = "ACTION_NAME";

        return action.post().then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(action.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            true,
          ]);
          assert.ok(
            request.header
              .getCall(0)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(1).calledWith("Accept", "application/json")
          );
          assert.ok(action.reset.called);
          assert.ok(innerAgent.post.calledWith("/ACTION_NAME", "HEADERS"));
        });
      });
      it("Success send request and receive response content", function () {
        innerAgent.post = sinon
          .stub()
          .returns(Promise.reject(new Error("ERROR")));
        action.meta.name = "ACTION_NAME";

        return action.post().catch((err) => {
          assert.ok(err.message, "ERROR");
          assert.ok(
            request.header
              .getCall(0)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(1).calledWith("Accept", "application/json")
          );
          assert.ok(action.reset.called);
          assert.ok(innerAgent.post.calledWith("/ACTION_NAME", "HEADERS"));
        });
      });
      it("Success send request and receive response content with array", function () {
        innerAgent.post = sinon
          .stub()
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        action.meta.name = "ACTION_NAME";

        return action.post().then((res) => {
          assert.deepEqual(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(action.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
          assert.ok(
            request.header
              .getCall(0)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(1).calledWith("Accept", "application/json")
          );
          assert.ok(action.reset.called);
          assert.ok(innerAgent.post.calledWith("/ACTION_NAME", "HEADERS"));
        });
      });
      it("Success send request and receive response content without csrf token", function () {
        innerAgent.fetchToken = sinon.stub().returns(Promise.resolve(null));
        innerAgent.post = sinon
          .stub()
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        action.meta.name = "ACTION_NAME";

        return action.post().then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(action.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
          assert.ok(
            request.header
              .getCall(0)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(1).calledWith("Accept", "application/json")
          );
          assert.ok(request.header.calledTwice);
          assert.ok(action.reset.called);
          assert.ok(innerAgent.post.calledWith("/ACTION_NAME", "HEADERS"));
        });
      });
    });
  });

  it(".getPath()", function () {
    action.meta.boundType = {};
    action.meta.parameters = [
      {},
      {
        name: "param",
      },
    ];
    const entity = {
      getSingleResourcePath: sinon.stub().returns("entity(...)"),
      getListResourcePath: sinon.stub().returns("entity"),
      urlQuery: sinon.stub().returns("urlQuery"),
    };

    assert.equal(action.getPath(entity), "/entity(...)/ns.an?urlQuery");

    action.meta.boundType.elementType = {};
    assert.equal(action.getPath(entity), "/entity/ns.an?urlQuery");

    assert.equal(
      action.getPath(undefined, {
        name: "actionImport",
      }),
      "/actionImport"
    );
    assert.equal(action.getPath(), "/an");
  });

  it(".getPayload()", function () {
    const parameters = {
      a: 1,
      b: [{ c: 2 }],
    };
    const request = {
      header: sinon.stub(),
    };
    const getParamDefinition = sinon.stub(action, "getParameterDefinition");
    getParamDefinition.withArgs("a").returns({
      type: {
        formatBody: (x) => x,
      },
    });
    getParamDefinition.withArgs("b").returns({
      type: {
        elementType: {
          formatBody: (x) => x,
        },
      },
    });
    assert.deepEqual(action.getPayload(parameters, request), {
      a: 1,
      b: [{ c: 2 }],
    });
    assert.ok(request.header.called);
    assert.deepEqual(request.header.args[0], [
      "Content-type",
      "application/json",
    ]);
  });
});
