"use strict";

const _ = require("lodash");
const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("FunctionImport", function () {
  var FunctionImport;
  var functionImport;
  var functionImportProperties;
  var functionImportModel;
  var innerAgent;

  beforeEach(function () {
    innerAgent = {};
    functionImportProperties = {};
    functionImportModel = {
      getParameter: () => ({
        type: {
          format: (x) => x,
        },
      }),
      getLegacyApiObject: () => functionImportProperties,
    };

    FunctionImport = proxyquire("../../../lib/engine/FunctionImport", {});
    functionImport = new FunctionImport(innerAgent, functionImportModel);
  });

  it("#constructor()", function () {
    assert.deepEqual(functionImport.agent, innerAgent);
    assert.deepEqual(functionImport.meta, functionImportModel);
    assert.deepEqual(functionImport.properties, {});
    assert.deepEqual(functionImport.defaultRequest, functionImport._defaults);
  });

  it(".createDirectCaller()", function () {
    let directCaller;

    sinon.stub(functionImport, "call");
    directCaller = functionImport.createDirectCaller();

    directCaller("ARGUMENTS");

    assert.ok(functionImport.call.calledWith("ARGUMENTS"));
  });

  describe(".call()", function () {
    it("Call FunctionImport without parameters", function () {
      sinon.stub(functionImport, "parameter");
      sinon.stub(functionImport, "httpMethod").returns("post");
      sinon.stub(functionImport, "post").returns("PROMISE");

      assert.equal(functionImport.call(), "PROMISE");
      assert.ok(functionImport.parameter.notCalled);
      assert.ok(functionImport.httpMethod.called);
      assert.ok(functionImport.post.called);
    });
    it("Call FunctionImport by get method", function () {
      sinon.stub(functionImport, "parameter");
      sinon.stub(functionImport, "httpMethod").returns("get");
      sinon.stub(functionImport, "get").returns("PROMISE");
      sinon.stub(functionImport, "post");

      assert.equal(functionImport.call(), "PROMISE");
      assert.ok(functionImport.parameter.notCalled);
      assert.ok(functionImport.httpMethod.called);
      assert.ok(functionImport.get.called);
      assert.ok(functionImport.post.notCalled);
    });
    it("Call FunctionImport without parameters", function () {
      sinon.stub(functionImport.defaultRequest, "parameters");
      sinon.stub(functionImport, "httpMethod").returns("post");
      sinon.stub(functionImport, "post").returns("PROMISE");

      let params = {
        PARAM1: "VALUE1",
        PARAM2: "VALUE2",
      };

      assert.equal(functionImport.call(params), "PROMISE");

      assert.ok(functionImport.defaultRequest.parameters.calledWith(params));
      assert.ok(functionImport.httpMethod.called);
      assert.ok(functionImport.post.called);
    });
  });

  it(".parameter()", function () {
    sinon.stub(functionImport.meta, "getParameter").returns({
      type: {
        format: () => "ODATA_PRIMITIVE_VALUE",
      },
    });

    functionImport.parameter("PARAMETER_NAME", "PARAMETER_VALUE");

    assert.equal(
      functionImport.defaultRequest._parameters.PARAMETER_NAME,
      "ODATA_PRIMITIVE_VALUE"
    );
  });

  it(".httpMethod()", function () {
    functionImport.meta.httpMethod = "GET";
    assert.equal(functionImport.httpMethod(), "get");
    functionImport.meta.httpMethod = "POST";
    assert.equal(functionImport.httpMethod(), "post");
    delete functionImport.meta.httpMethod;
    assert.equal(functionImport.httpMethod(), "post");
  });

  describe(".post()", function () {
    describe("use batch", function () {
      beforeEach(() => {
        sinon.stub(functionImport, "queryFromParameters").returns("QUERY");
        sinon.stub(functionImport, "header");
        sinon.stub(functionImport, "reset");
        sinon
          .stub(functionImport, "normalizeResponse")
          .returns(Promise.resolve("NORMALIZED_RESPONSE_CONTENT"));
        sinon
          .stub(functionImport, "_handleBatchCall")
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
        functionImport.defaultRequest._headers = "HEADERS";
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        promise = functionImport.post();

        assert.strictEqual(
          functionImport._handleBatchCall.getCall(0).args[1],
          innerAgent.batchManager.defaultBatch
        );

        functionImport._handleBatchCall.getCall(0).args[0]();
        assert.ok(
          innerAgent.batchManager.defaultBatch.post.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            undefined,
            "DEFAULT_CHANGESET"
          )
        );
        assert.ok(functionImport.reset.called);
        return promise.then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
          assert.ok(
            functionImport.header
              .getCall(0)
              .calledWith("Accept", "application/json")
          );
          assert.ok(functionImport.header.calledOnce);
        });
      });
      it("Success send request and receive raw response", function () {
        let promise;
        functionImport.defaultRequest._headers = "HEADERS";
        functionImport.defaultRequest._isRaw = true;
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        promise = functionImport.post();

        assert.strictEqual(
          functionImport._handleBatchCall.getCall(0).args[1],
          innerAgent.batchManager.defaultBatch
        );

        functionImport._handleBatchCall.getCall(0).args[0]();

        assert.ok(
          innerAgent.batchManager.defaultBatch.post.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            undefined,
            "DEFAULT_CHANGESET"
          )
        );

        return promise.then((res) => {
          assert.ok(
            functionImport.header
              .getCall(0)
              .calledWith("Accept", "application/json")
          );
          assert.ok(functionImport.reset.called);
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            true,
          ]);
        });
      });
      it("Success send request and receive response content with array", function () {
        let promise;

        functionImport._handleBatchCall.returns(
          Promise.resolve("RESPONSE_CONTENT")
        );
        functionImport.defaultRequest._headers = "HEADERS";
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        promise = functionImport.post();

        assert.strictEqual(
          functionImport._handleBatchCall.getCall(0).args[1],
          innerAgent.batchManager.defaultBatch
        );

        functionImport._handleBatchCall.getCall(0).args[0]();
        assert.ok(
          innerAgent.batchManager.defaultBatch.post.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            undefined,
            "DEFAULT_CHANGESET"
          )
        );

        return promise.then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
          assert.ok(
            functionImport.header
              .getCall(0)
              .calledWith("Accept", "application/json")
          );
          assert.ok(functionImport.reset.called);
        });
      });
    });

    describe("direct call", function () {
      let request;

      beforeEach(() => {
        sinon.stub(functionImport, "queryFromParameters").returns("QUERY");
        sinon.stub(functionImport, "reset");
        sinon
          .stub(functionImport, "normalizeResponse")
          .returns(Promise.resolve("NORMALIZED_RESPONSE_CONTENT"));
        sinon
          .stub(functionImport, "_handleBatchCall")
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        innerAgent.batchManager = {};
        request = {
          header: sinon.stub(),
          _headers: "HEADERS",
          _isRaw: false,
        };
        Object.defineProperty(functionImport, "defaultRequest", {
          get: sinon.stub().returns(request),
        });
      });
      it("Success send request and receive response content", function () {
        innerAgent.post = sinon
          .stub()
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        functionImport.defaultRequest._headers = "HEADERS";
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
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
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.post.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive raw response", function () {
        innerAgent.post = sinon
          .stub()
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        request._isRaw = true;
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
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
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.post.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive response content", function () {
        innerAgent.post = sinon
          .stub()
          .returns(Promise.reject(new Error("ERROR")));
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().catch((err) => {
          assert.ok(err.message, "ERROR");
          assert.ok(
            request.header
              .getCall(0)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(1).calledWith("Accept", "application/json")
          );
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.post.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive response content with array", function () {
        innerAgent.post = sinon
          .stub()
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().then((res) => {
          assert.deepEqual(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
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
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.post.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive response content without csrf token", function () {
        innerAgent.fetchToken = sinon.stub().returns(Promise.resolve(null));
        innerAgent.post = sinon
          .stub()
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
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
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.post.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
    });
  });

  describe(".get()", function () {
    describe("use batch", function () {
      let defaultBatch;
      beforeEach(() => {
        sinon.stub(functionImport, "queryFromParameters").returns("QUERY");
        sinon.stub(functionImport, "header");
        sinon.stub(functionImport, "reset");
        sinon
          .stub(functionImport, "normalizeResponse")
          .returns(Promise.resolve("NORMALIZED_RESPONSE_CONTENT"));
        sinon
          .stub(functionImport, "_handleBatchCall")
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        functionImport.defaultRequest._headers = "HEADERS";
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";
        defaultBatch = {
          get: sinon.stub(),
        };
        innerAgent.getResultPath = sinon.stub().returns("body.d.results");
        innerAgent.batchManager = {
          defaultBatch: defaultBatch,
          defaultChangeSet: "DEFAULT_CHANGESET",
        };
      });
      it("Success send request and receive response content", function () {
        let promise = functionImport.get();
        functionImport._handleBatchCall.getCall(0).args[0]();
        assert.ok(
          functionImport._handleBatchCall.getCall(0).args[1],
          defaultBatch
        );
        assert.ok(
          defaultBatch.get.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
        );
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("Accept", "application/json")
        );
        assert.ok(functionImport.reset.called);
        return promise.then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
        });
      });
      it("Success send request and receive raw response content", function () {
        functionImport.defaultRequest._isRaw = true;
        let promise = functionImport.get();
        functionImport._handleBatchCall.getCall(0).args[0]();
        assert.ok(
          functionImport._handleBatchCall.getCall(0).args[1],
          defaultBatch
        );
        assert.ok(
          defaultBatch.get.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
        );
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("Accept", "application/json")
        );

        assert.ok(functionImport.reset.called);
        return promise.then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            true,
          ]);
        });
      });
      it("Success send request and receive response content", function () {
        let promise = functionImport.get().then((res) => {
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
        });
        assert.ok(functionImport.reset.called);
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("Accept", "application/json")
        );
        functionImport._handleBatchCall.getCall(0).args[0]();
        assert.ok(
          functionImport._handleBatchCall.getCall(0).args[1],
          defaultBatch
        );
        assert.ok(
          defaultBatch.get.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
        );
        return promise;
      });
      it("Invalid response", function () {
        let promise;
        functionImport._handleBatchCall.returns(
          Promise.reject(new Error("ERROR"))
        );
        promise = functionImport
          .get()
          .then(() => {
            assert(false);
          })
          .catch((err) => {
            assert(_.isError(err));
            assert.ok(
              functionImport.header
                .getCall(0)
                .calledWith("Accept", "application/json")
            );
          });
        assert.ok(functionImport.reset.called);
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("Accept", "application/json")
        );

        return promise;
      });
    });

    describe("use direct calls", function () {
      let promise;
      let request;
      beforeEach(() => {
        sinon.stub(functionImport, "queryFromParameters").returns("QUERY");
        sinon.stub(functionImport, "reset");
        sinon.stub(functionImport, "_handleBatchCall");
        sinon
          .stub(functionImport, "normalizeResponse")
          .returns(Promise.resolve("NORMALIZED_RESPONSE_CONTENT"));
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";
        innerAgent.get = sinon
          .stub()
          .returns(Promise.resolve("RESPONSE_CONTENT"));
        innerAgent.getResultPath = sinon.stub().returns("body.d.results");
        innerAgent.batchManager = {};
        request = {
          header: sinon.stub(),
          _headers: "HEADERS",
          _isRaw: false,
        };
        Object.defineProperty(functionImport, "defaultRequest", {
          get: sinon.stub().returns(request),
        });
      });
      it("Success send request and receive response content", function () {
        promise = functionImport.get();
        assert.deepEqual(request.header.args, [
          ["Content-type", "application/json"],
          ["Accept", "application/json"],
        ]);

        return promise.then((res) => {
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.get.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive raw response content", function () {
        functionImport.defaultRequest._isRaw = true;
        promise = functionImport.get();

        assert.deepEqual(request.header.args, [
          ["Content-type", "application/json"],
          ["Accept", "application/json"],
        ]);
        return promise.then((res) => {
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            true,
          ]);
          assert.equal(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.get.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive response content", function () {
        promise = functionImport.get();
        assert.deepEqual(request.header.args, [
          ["Content-type", "application/json"],
          ["Accept", "application/json"],
        ]);
        return promise.then((res) => {
          assert.deepEqual(functionImport.normalizeResponse.getCall(0).args, [
            "RESPONSE_CONTENT",
            false,
          ]);
          assert.deepEqual(res, "NORMALIZED_RESPONSE_CONTENT");
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.get.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Invalid response", function () {
        innerAgent.get.returns(Promise.reject(new Error("ERROR")));

        promise = functionImport.get();

        assert.deepEqual(request.header.args, [
          ["Content-type", "application/json"],
          ["Accept", "application/json"],
        ]);
        return promise.catch((err) => {
          assert(_.isError(err));
          assert.ok(functionImport.reset.called);
        });
      });
    });
  });

  it(".queryFromParameters()", function () {
    functionImport.defaultRequest._query = {};
    functionImport.defaultRequest._parameters = {};
    assert.strictEqual(functionImport.queryFromParameters(), "");

    functionImport.defaultRequest._query = {
      PARAM1: "#",
    };
    functionImport.defaultRequest._parameters = {
      PARAM1: "#",
    };
    assert.strictEqual(
      functionImport.queryFromParameters(),
      "PARAM1=#&PARAM1=#"
    );
  });

  describe(".normalizeResponse", function () {
    let rawResponse;

    beforeEach(function () {
      rawResponse = {
        json: sinon.stub(),
        headers: {
          get: sinon.stub(),
        },
      };

      innerAgent._listResultPath = "d.results";
      innerAgent._instanceResultPath = "d";
    });

    it("raw response requested", function () {
      return functionImport
        .normalizeResponse(rawResponse, true)
        .then((normalizedResponse) => {
          assert.equal(normalizedResponse, rawResponse);
        });
    });
    it("invalid content type", function () {
      return functionImport
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.equal(normalizedResponse, rawResponse);
        });
    });
    it("non-json content type", function () {
      rawResponse.headers.get.returns("text/plain");
      return functionImport
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.equal(normalizedResponse, rawResponse);
        });
    });
    it("without specified content", function () {
      rawResponse.headers.get.returns("application/json");
      rawResponse.json.returns(Promise.resolve("RESULT"));
      return functionImport
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.equal(normalizedResponse, "RESULT");
        });
    });
    it("array content", function () {
      rawResponse.headers.get.returns("application/json");
      rawResponse.json.returns(
        Promise.resolve({
          d: {
            results: [],
          },
        })
      );
      return functionImport
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.deepEqual(normalizedResponse, []);
        });
    });
    it("object content", function () {
      rawResponse.headers.get.returns("application/json");
      rawResponse.json.returns(Promise.resolve({ d: {} }));
      return functionImport
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.deepEqual(normalizedResponse, {});
        });
    });
  });
});
