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
    beforeEach(() => {
      sinon.stub(functionImport, "queryFromParameters").returns("QUERY");
      sinon.stub(functionImport, "header");
      sinon.stub(functionImport, "reset");
      innerAgent.batchManager = {
        defaultBatch: "DEFAULT_BATCH",
        defaultChangeSet: "DEFAULT_CHANGESET",
      };
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
          functionImport.header
            .getCall(0)
            .calledWith("x-csrf-token", "CSRF_TOKEN")
        );
        assert.ok(
          functionImport.header
            .getCall(1)
            .calledWith("Content-type", "application/json")
        );
        assert.ok(
          functionImport.header
            .getCall(2)
            .calledWith("Accept", "application/json")
        );
        assert.ok(functionImport.reset.called);
        assert.ok(
          innerAgent.post.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            undefined,
            "DEFAULT_BATCH",
            "DEFAULT_CHANGESET"
          )
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
      functionImport.defaultRequest._headers = "HEADERS";
      functionImport.defaultRequest._isRaw = true;
      functionImport.meta.name = "FUNCTION_IMPORT_NAME";

      return functionImport.post().then((res) => {
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("x-csrf-token", "CSRF_TOKEN")
        );
        assert.ok(
          functionImport.header
            .getCall(1)
            .calledWith("Content-type", "application/json")
        );
        assert.ok(
          functionImport.header
            .getCall(2)
            .calledWith("Accept", "application/json")
        );
        assert.ok(functionImport.reset.called);
        assert.ok(
          innerAgent.post.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            undefined,
            "DEFAULT_BATCH",
            "DEFAULT_CHANGESET"
          )
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
      functionImport.defaultRequest._headers = "HEADERS";
      functionImport.meta.name = "FUNCTION_IMPORT_NAME";

      return functionImport.post().catch((err) => {
        assert.ok(err.message, "ERROR");
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("x-csrf-token", "CSRF_TOKEN")
        );
        assert.ok(
          functionImport.header
            .getCall(1)
            .calledWith("Content-type", "application/json")
        );
        assert.ok(
          functionImport.header
            .getCall(2)
            .calledWith("Accept", "application/json")
        );
        assert.ok(functionImport.reset.called);
        assert.ok(
          innerAgent.post.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            undefined,
            "DEFAULT_BATCH",
            "DEFAULT_CHANGESET"
          )
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
      functionImport.defaultRequest._headers = "HEADERS";
      functionImport.meta.name = "FUNCTION_IMPORT_NAME";

      return functionImport.post().then((res) => {
        assert.deepEqual(res, [{}, {}, {}]);
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("x-csrf-token", "CSRF_TOKEN")
        );
        assert.ok(
          functionImport.header
            .getCall(1)
            .calledWith("Content-type", "application/json")
        );
        assert.ok(
          functionImport.header
            .getCall(2)
            .calledWith("Accept", "application/json")
        );
        assert.ok(functionImport.reset.called);
        assert.ok(
          innerAgent.post.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            undefined,
            "DEFAULT_BATCH",
            "DEFAULT_CHANGESET"
          )
        );
      });
    });
  });

  describe(".get()", function () {
    let response = {
      body: {
        d: "RESPONSE_CONTENT",
      },
    };
    beforeEach(() => {
      sinon.stub(functionImport, "queryFromParameters").returns("QUERY");
      sinon.stub(functionImport, "header");
      sinon.stub(functionImport, "reset");
      functionImport.defaultRequest._headers = "HEADERS";
      functionImport.meta.name = "FUNCTION_IMPORT_NAME";
      innerAgent.get = sinon.stub().returns(Promise.resolve(response));
      innerAgent.getResultPath = sinon.stub().returns("body.d.results");
      innerAgent.batchManager = {
        defaultBatch: "DEFAULT_BATCH",
        defaultChangeSet: "DEFAULT_CHANGESET",
      };
    });
    it("Success send request and receive response content", function () {
      return functionImport.get().then((res) => {
        assert.equal(res, "RESPONSE_CONTENT");
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("Accept", "application/json")
        );
        assert.ok(functionImport.reset.called);
        assert.ok(
          innerAgent.get.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            "DEFAULT_BATCH",
            "DEFAULT_CHANGESET"
          )
        );
      });
    });
    it("Success send request and receive raw response content", function () {
      functionImport.defaultRequest._isRaw = true;
      return functionImport.get().then((res) => {
        assert.deepEqual(res, {
          body: {
            d: "RESPONSE_CONTENT",
          },
        });
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("Accept", "application/json")
        );
        assert.ok(functionImport.reset.called);
        assert.ok(
          innerAgent.get.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            "DEFAULT_BATCH",
            "DEFAULT_CHANGESET"
          )
        );
      });
    });
    it("Success send request and receive response content", function () {
      response.body.d = {
        results: [{}, {}, {}],
      };
      return functionImport.get().then((res) => {
        assert.deepEqual(res, [{}, {}, {}]);
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("Accept", "application/json")
        );
        assert.ok(functionImport.reset.called);
        assert.ok(
          innerAgent.get.calledWith(
            "/FUNCTION_IMPORT_NAME?QUERY",
            "HEADERS",
            "DEFAULT_BATCH",
            "DEFAULT_CHANGESET"
          )
        );
      });
    });
    it("Invalid response", function () {
      innerAgent.get.returns(Promise.reject(new Error("ERROR")));
      return functionImport.get().catch((err) => {
        assert(_.isError(err));
        assert.ok(
          functionImport.header
            .getCall(0)
            .calledWith("Accept", "application/json")
        );
        assert.ok(functionImport.reset.called);
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
    functionImport.defaultRequest._isRaw = true;
    assert.deepEqual(
      functionImport.normalizeResponse({
        body: {
          d: {
            results: "VALUE",
          },
        },
      }),
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
