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
    innerAgent = {
      _listResultPath: "body.d.results",
      _instanceResultPath: "body.d",
    };
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
      let response;
      beforeEach(() => {
        response = {
          body: {
            d: "RESPONSE_CONTENT",
          },
        };
        sinon.stub(functionImport, "queryFromParameters").returns("QUERY");
        sinon.stub(functionImport, "header");
        sinon.stub(functionImport, "reset");
        sinon
          .stub(functionImport, "_handleBatchCall")
          .returns(Promise.resolve(response));
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
          assert.equal(res, "RESPONSE_CONTENT");
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
          assert.deepEqual(res, {
            body: {
              d: "RESPONSE_CONTENT",
            },
          });
        });
      });
      it("Success send request and receive response content with array", function () {
        let promise;

        functionImport._handleBatchCall.returns(
          Promise.resolve({
            body: {
              d: {
                results: [{}, {}, {}],
              },
            },
          })
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
          assert.deepEqual(res, [{}, {}, {}]);
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
        innerAgent.batchManager = {};
        request = {
          header: sinon.stub(),
          _headers: "HEADERS",
        };
        Object.defineProperty(functionImport, "defaultRequest", {
          get: sinon.stub().returns(request),
        });
      });
      it("Success send request and receive response content", function () {
        innerAgent.fetchToken = sinon
          .stub()
          .returns(Promise.resolve("CSRF_TOKEN"));
        innerAgent.post = sinon.stub().returns(
          Promise.resolve({
            body: {
              d: "RESPONSE_CONTENT",
            },
          })
        );
        functionImport.defaultRequest._headers = "HEADERS";
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().then((res) => {
          assert.equal(res, "RESPONSE_CONTENT");
          assert.ok(
            request.header.getCall(0).calledWith("x-csrf-token", "CSRF_TOKEN")
          );
          assert.ok(
            request.header
              .getCall(1)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(2).calledWith("Accept", "application/json")
          );
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.post.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive raw response", function () {
        innerAgent.fetchToken = sinon
          .stub()
          .returns(Promise.resolve("CSRF_TOKEN"));
        innerAgent.post = sinon.stub().returns(
          Promise.resolve({
            body: {
              d: "RESPONSE_CONTENT",
            },
          })
        );
        request._isRaw = true;
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().then((res) => {
          assert.ok(
            request.header.getCall(0).calledWith("x-csrf-token", "CSRF_TOKEN")
          );
          assert.ok(
            request.header
              .getCall(1)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(2).calledWith("Accept", "application/json")
          );
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.post.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
          assert.deepEqual(res, {
            body: {
              d: "RESPONSE_CONTENT",
            },
          });
        });
      });
      it("Reject during fetching CSRF token", function () {
        innerAgent.fetchToken = sinon
          .stub()
          .returns(Promise.reject(new Error("ERROR")));

        return functionImport.post().catch((err) => {
          assert.equal(err.message, "ERROR");
        });
      });
      it("Success send request and receive response content", function () {
        innerAgent.fetchToken = sinon
          .stub()
          .returns(Promise.resolve("CSRF_TOKEN"));
        innerAgent.post = sinon
          .stub()
          .returns(Promise.reject(new Error("ERROR")));
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().catch((err) => {
          assert.ok(err.message, "ERROR");
          assert.ok(
            request.header.getCall(0).calledWith("x-csrf-token", "CSRF_TOKEN")
          );
          assert.ok(
            request.header
              .getCall(1)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(2).calledWith("Accept", "application/json")
          );
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.post.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive response content with array", function () {
        innerAgent.fetchToken = sinon
          .stub()
          .returns(Promise.resolve("CSRF_TOKEN"));
        innerAgent.post = sinon.stub().returns(
          Promise.resolve({
            body: {
              d: {
                results: [{}, {}, {}],
              },
            },
          })
        );
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().then((res) => {
          assert.deepEqual(res, [{}, {}, {}]);
          assert.ok(
            request.header.getCall(0).calledWith("x-csrf-token", "CSRF_TOKEN")
          );
          assert.ok(
            request.header
              .getCall(1)
              .calledWith("Content-type", "application/json")
          );
          assert.ok(
            request.header.getCall(2).calledWith("Accept", "application/json")
          );
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.post.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive response content without csrf token", function () {
        innerAgent.fetchToken = sinon.stub().returns(Promise.resolve(null));
        innerAgent.post = sinon.stub().returns(
          Promise.resolve({
            body: {
              d: "RESPONSE_CONTENT",
            },
          })
        );
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";

        return functionImport.post().then((res) => {
          assert.equal(res, "RESPONSE_CONTENT");
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
    let response;
    describe("use batch", function () {
      let defaultBatch;
      beforeEach(() => {
        response = {
          body: {
            d: "RESPONSE_CONTENT",
          },
        };
        sinon.stub(functionImport, "queryFromParameters").returns("QUERY");
        sinon.stub(functionImport, "header");
        sinon.stub(functionImport, "reset");
        sinon
          .stub(functionImport, "_handleBatchCall")
          .returns(Promise.resolve(response));
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
          assert.equal(res, "RESPONSE_CONTENT");
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
          assert.deepEqual(res, {
            body: {
              d: "RESPONSE_CONTENT",
            },
          });
        });
      });
      it("Success send request and receive response content", function () {
        response.body.d = {
          results: [{}, {}, {}],
        };
        let promise = functionImport.get().then((res) => {
          assert.deepEqual(res, [{}, {}, {}]);
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
        response = {
          body: {
            d: "RESPONSE_CONTENT",
          },
        };
        sinon.stub(functionImport, "queryFromParameters").returns("QUERY");
        sinon.stub(functionImport, "reset");
        sinon.stub(functionImport, "_handleBatchCall");
        functionImport.meta.name = "FUNCTION_IMPORT_NAME";
        innerAgent.get = sinon.stub().returns(Promise.resolve(response));
        innerAgent.getResultPath = sinon.stub().returns("body.d.results");
        innerAgent.batchManager = {};
        request = {
          header: sinon.stub(),
          _headers: "HEADERS",
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
          assert.equal(res, "RESPONSE_CONTENT");
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
          assert.deepEqual(res, {
            body: {
              d: "RESPONSE_CONTENT",
            },
          });
          assert.ok(functionImport.reset.called);
          assert.ok(
            innerAgent.get.calledWith("/FUNCTION_IMPORT_NAME?QUERY", "HEADERS")
          );
        });
      });
      it("Success send request and receive response content", function () {
        response.body.d = {
          results: [{}, {}, {}],
        };
        promise = functionImport.get();
        assert.deepEqual(request.header.args, [
          ["Content-type", "application/json"],
          ["Accept", "application/json"],
        ]);
        return promise.then((res) => {
          assert.deepEqual(res, [{}, {}, {}]);
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

  it(".normalizeResponse", function () {
    assert.deepEqual(
      functionImport.normalizeResponse({
        body: {
          d: {
            property: "key",
          },
        },
      }),
      {
        property: "key",
      }
    );
    assert.deepEqual(
      functionImport.normalizeResponse({
        body: {
          d: {
            results: ["A", "B"],
          },
        },
      }),
      ["A", "B"]
    );
    assert.deepEqual(
      functionImport.normalizeResponse({
        body: {
          d: {
            results: "VALUE",
          },
        },
      }),
      {
        results: "VALUE",
      }
    );
    assert.throws(
      () => {
        functionImport.normalizeResponse({
          body: {
            INVALID: "RESPONSE",
          },
        });
      },
      {
        message: "Invalid oData response from backend",
      }
    );
    assert.deepEqual(
      functionImport.normalizeResponse(
        {
          body: {
            d: {
              results: "VALUE",
            },
          },
        },
        true
      ),
      {
        body: {
          d: {
            results: "VALUE",
          },
        },
      }
    );
  });
});
