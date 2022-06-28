"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const _ = require("lodash");
const agentUrl = require("../../../lib/agent/url");
const xml2js = require("xml2js");
const tough = require("tough-cookie");
const log = require("../../../lib/agent/log");
const authentication = require("../../../lib/agent/authentication");

let Agent;
let agent;
let sandbox = sinon.createSandbox();
let nodeFetch = sinon.stub();

describe("lib/engine/Agent", function () {
  beforeEach(function () {
    Agent = proxyquire("../../../lib/agent/Agent", {
      "node-fetch": nodeFetch,
    });
    sandbox.stub(tough, "CookieJar").returns({
      getCookieString: sinon.stub(),
      setCookie: sinon.stub(),
    });
    agent = new Agent({
      url: "URL",
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe("#constructor()", function () {
    it("Properties are initialized", function () {
      assert.deepEqual(agent.settings, {
        url: "URL",
      });
      assert.ok(_.has(agent, "logger"));
    });
  });

  describe(".metadataSearch()", function () {
    it("Ignore undefined", function () {
      assert.strictEqual(agent.metadataSearch(), "");
    });
    it("Process string parameter", function () {
      assert.strictEqual(
        agent.metadataSearch({
          foo: "bar",
        }),
        "foo=bar"
      );
    });
    it("Process string parameter", function () {
      assert.strictEqual(
        agent.metadataSearch({
          foo: 1,
        }),
        "foo=1"
      );
    });
    it("Process array parameter", function () {
      assert.strictEqual(
        agent.metadataSearch({
          foo: ["bar1", "bar2", "bar3"],
        }),
        "foo=bar1,bar2,bar3"
      );
    });
    it("Ignore object parameter", function () {
      assert.strictEqual(
        agent.metadataSearch({
          foo: {
            foo1: "bar",
          },
        }),
        ""
      );
    });
    it("Ignore undefined parameter", function () {
      assert.strictEqual(
        agent.metadataSearch({
          foo: undefined,
        }),
        ""
      );
    });
    it("Ignore null parameter", function () {
      assert.strictEqual(
        agent.metadataSearch({
          foo: null,
        }),
        ""
      );
    });
  });

  describe(".metadata()", function () {
    beforeEach(function () {
      sinon.stub(agent, "metadataSearch").returns("PARAMETERS");
      sandbox.stub(authentication, "authenticate").returns(Promise.resolve());
      sinon
        .stub(agent, "createMetadataRequest")
        .returns(Promise.resolve("RESPONSE_BODY"));
      sandbox.stub(agentUrl, "appendSearch");
    });
    it("Read core metadata only", function () {
      return agent.metadata().then((responses) => {
        assert.deepEqual(responses, ["RESPONSE_BODY"]);
        assert.ok(agent.createMetadataRequest.calledOnce);
        assert.ok(
          agent.createMetadataRequest.getCall(0).args[0],
          "URL/$metadata?PARAMETERS"
        );
        assert.equal(
          authentication.authenticate.getCall(0).args[1],
          "URL/$metadata?PARAMETERS"
        );
        assert.equal(authentication.authenticate.getCall(0).args[0], agent);
      });
    });
    it("Read core metadata and annotations metadata", function () {
      agent.createMetadataRequest
        .onCall(0)
        .returns(Promise.resolve("METADATA_RESPONSE_BODY"));
      agent.createMetadataRequest
        .onCall(1)
        .returns(Promise.resolve("ANNOTATIONS_RESPONSE_BODY"));
      agentUrl.appendSearch.returns("ANNOTATIONS_URL_WITH_PARAMETERS");
      agent.settings.annotationsUrl = "ANNOTATIONS_URL";

      return agent.metadata().then((responses) => {
        assert.deepEqual(responses, [
          "METADATA_RESPONSE_BODY",
          "ANNOTATIONS_RESPONSE_BODY",
        ]);
        assert.ok(agent.createMetadataRequest.calledTwice);
        assert.equal(authentication.authenticate.getCall(0).args[0], agent);
        assert.equal(
          authentication.authenticate.getCall(0).args[1],
          "URL/$metadata?PARAMETERS"
        );
        assert.equal(
          agent.createMetadataRequest.getCall(0).args[0],
          "URL/$metadata?PARAMETERS"
        );
        assert.equal(
          agent.createMetadataRequest.getCall(1).args[0],
          "ANNOTATIONS_URL_WITH_PARAMETERS"
        );
        assert.equal(
          agentUrl.appendSearch.getCall(0).args[0],
          "ANNOTATIONS_URL"
        );
        assert.equal(agentUrl.appendSearch.getCall(0).args[1], "PARAMETERS");
      });
    });
  });

  describe(".createMetadataRequest()", function () {
    beforeEach(function () {
      sinon.stub(agent, "fetch").returns(
        Promise.resolve({
          text: sinon.stub().returns(Promise.resolve("METADATA_RESPONSE")),
        })
      );
      sinon.stub(agent.logger, "info");
      sandbox
        .stub(xml2js, "parseString")
        .yieldsRight(null, "METADATA_DOM_OBJECT");
    });
    it("Successfull request", function () {
      return agent.createMetadataRequest("METADATA_URL").then((res) => {
        assert.equal(res, "METADATA_DOM_OBJECT");
        assert.ok(agent.fetch.calledWithExactly("METADATA_URL"));
        assert.ok(
          agent.logger.info.calledWithExactly(
            "Metadata successfully fetched from 'METADATA_URL'."
          )
        );
      });
    });
    it("HTTP request rejected", function () {
      agent.fetch.returns(Promise.reject("ERROR"));
      return agent.createMetadataRequest("METADATA_URL").catch((err) => {
        assert.equal(err, "ERROR");
        assert.ok(agent.fetch.calledWithExactly("METADATA_URL"));
      });
    });
    it("metadata XML parsed with errors", function () {
      xml2js.parseString.yieldsRight("PARSE_ERROR", "METADATA_DOM_OBJECT");
      return agent.createMetadataRequest("METADATA_URL").catch((err) => {
        assert.equal(err, "PARSE_ERROR");
        assert.ok(agent.fetch.calledWithExactly("METADATA_URL"));
      });
    });
  });

  it(".delete()", function () {
    sinon.stub(agent, "sendRequest").returns("PROMISE");
    assert.equal(agent.delete("INPUT_PATH", "HEADERS"), "PROMISE");
    assert.ok(agent.sendRequest.calledWith("DELETE", "INPUT_PATH", "HEADERS"));
  });

  it(".post()", function () {
    sinon.stub(agent, "sendRequest").returns("PROMISE");
    assert.equal(agent.post("INPUT_PATH", "HEADERS", "PAYLOAD"), "PROMISE");
    assert.ok(
      agent.sendRequest.calledWith("POST", "INPUT_PATH", "HEADERS", "PAYLOAD")
    );
  });

  describe(".sendRequest()", function () {
    beforeEach(() => {
      sinon.stub(agent, "fetchToken").returns(Promise.resolve("X_CSRF_TOKEN"));
      sinon.stub(agent, "fetch").returns(Promise.resolve("RESPONSE"));
      sandbox.stub(agentUrl, "normalize").returns("SERVICE_URL");
    });
    it("does not use csrf token", function () {
      return agent
        .sendRequest("get", "INPUT_URL", {
          additionalParameter: "ADDITIONAL_PARAMETER",
        })
        .then((response) => {
          assert.ok(agentUrl.normalize.calledWith("INPUT_URL", "URL"));
          assert.equal(response, "RESPONSE");
          assert.ok(
            agent.fetch.calledWith("SERVICE_URL", {
              method: "GET",
              headers: {
                additionalParameter: "ADDITIONAL_PARAMETER",
              },
            })
          );
        });
    });
    it("use csrf token", function () {
      return agent
        .sendRequest("DELETE", "INPUT_URL", { "sap-server": "true" })
        .then((response) => {
          assert.equal(response, "RESPONSE");
          assert.ok(
            agent.fetch.calledWith("SERVICE_URL", {
              method: "DELETE",
              headers: {
                "sap-server": "true",
                "x-csrf-token": "X_CSRF_TOKEN",
              },
            })
          );
        });
    });
    it("use payload token", function () {
      return agent
        .sendRequest("POST", "INPUT_URL", { "sap-server": "true" }, "PAYLOAD")
        .then((response) => {
          assert.equal(response, "RESPONSE");
          assert.ok(
            agent.fetch.calledWith("SERVICE_URL", {
              method: "POST",
              body: "PAYLOAD",
              headers: {
                "sap-server": "true",
                "x-csrf-token": "X_CSRF_TOKEN",
              },
            })
          );
        });
    });
  });

  describe(".batch()", function () {
    it("Correctly handled batch request", function () {
      let batchObject = {
        payload: sinon.stub().returns("PAYLOAD"),
        process: sinon.stub().returns(Promise.resolve("REQUEST_RESPONSES")),
        boundary: sinon.stub().returns("BOUNDARY"),
        resolve: sinon.stub(),
      };
      let promiseBatch = Promise.resolve("BATCH_RESPONSE");
      promiseBatch.request = {};

      sinon.stub(agent, "fetchToken").returns(Promise.resolve("X_CSRF_TOKEN"));
      sinon.stub(agent, "sendRequest").returns(promiseBatch);
      sinon
        .stub(agent, "normalizeBatchResponse")
        .returns("NORMALIZED_BATCH_RESPONSE");
      agent.batchManager.remove = sinon.stub().returns();

      return agent.batch(batchObject, "RAW").then((response) => {
        assert.ok(batchObject.payload.calledWithExactly("X_CSRF_TOKEN"));
        assert.ok(
          agent.sendRequest.calledWithExactly(
            "POST",
            "/$batch",
            {
              "x-csrf-token": "X_CSRF_TOKEN",
              "Content-Type": "multipart/mixed;boundary=BOUNDARY",
              Accept: "multipart/mixed",
            },
            "PAYLOAD",
            true
          )
        );
        assert.ok(batchObject.process.calledWith("BATCH_RESPONSE"));
        assert.ok(
          agent.normalizeBatchResponse.calledWith(
            "BATCH_RESPONSE",
            "REQUEST_RESPONSES",
            "RAW"
          )
        );
        assert.equal(response, "NORMALIZED_BATCH_RESPONSE");
        assert.ok(agent.batchManager.remove.calledWithExactly(batchObject));
      });
    });
    it("Correctly handled batch request without csrf token", function () {
      let batchObject = {
        payload: sinon.stub().returns("PAYLOAD"),
        process: sinon.stub().returns(Promise.resolve("REQUEST_RESPONSES")),
        boundary: sinon.stub().returns("BOUNDARY"),
        resolve: sinon.stub(),
      };
      let promiseBatch = Promise.resolve("BATCH_RESPONSE");
      promiseBatch.request = {};

      sinon.stub(agent, "fetchToken").returns(Promise.resolve(null));
      sinon.stub(agent, "sendRequest").returns(promiseBatch);
      sinon
        .stub(agent, "normalizeBatchResponse")
        .returns("NORMALIZED_BATCH_RESPONSE");
      agent.batchManager.remove = sinon.stub().returns();

      return agent.batch(batchObject, "RAW").then(() => {
        assert.ok(batchObject.payload.calledWithExactly(null));
        assert.ok(
          agent.sendRequest.calledWithExactly(
            "POST",
            "/$batch",
            {
              "Content-Type": "multipart/mixed;boundary=BOUNDARY",
              Accept: "multipart/mixed",
            },
            "PAYLOAD",
            true
          )
        );
      });
    });
    it("Fetch token fails", function () {
      let batchObject = {
        reject: sinon.stub(),
      };

      sinon.stub(agent, "fetchToken").returns(Promise.reject("ERROR"));

      return agent.batch(batchObject, "RAW").catch((err) => {
        assert.equal(err, "ERROR");
      });
    });
    it("Fails batch request", function () {
      let batchObject = {
        payload: sinon.stub().returns("PAYLOAD"),
        boundary: sinon.stub().returns("BOUNDARY"),
        reject: sinon.stub(),
      };
      let promiseBatch = Promise.reject("ERROR");
      promiseBatch.request = {};

      sinon.stub(agent, "fetchToken").returns(Promise.resolve("X_CSRF_TOKEN"));
      sinon.stub(agent, "sendRequest").returns(promiseBatch);

      return agent.batch(batchObject, "RAW").catch((error) => {
        assert.ok(batchObject.payload.calledWithExactly("X_CSRF_TOKEN"));
        assert.ok(
          agent.sendRequest.calledWithExactly(
            "POST",
            "/$batch",
            {
              "x-csrf-token": "X_CSRF_TOKEN",
              "Content-Type": "multipart/mixed;boundary=BOUNDARY",
              Accept: "multipart/mixed",
            },
            "PAYLOAD",
            true
          )
        );
        assert.equal(error, "ERROR");
      });
    });
    it("fails batch processing", function () {
      let batchObject = {
        payload: sinon.stub().returns("PAYLOAD"),
        boundary: sinon.stub().returns("BOUNDARY"),
        process: sinon.stub().returns(Promise.reject("ERROR")),
        reject: sinon.stub(),
      };
      let promiseBatch = Promise.resolve("BATCH_RESPONSE");
      promiseBatch.request = {};

      sinon.stub(agent, "fetchToken").returns(Promise.resolve("X_CSRF_TOKEN"));
      sinon.stub(agent, "sendRequest").returns(promiseBatch);
      agent.batchManager.batches.push(batchObject);

      return agent.batch(batchObject, "RAW").catch((error) => {
        assert.ok(batchObject.payload.calledWithExactly("X_CSRF_TOKEN"));
        assert.ok(
          agent.sendRequest.calledWithExactly(
            "POST",
            "/$batch",
            {
              "x-csrf-token": "X_CSRF_TOKEN",
              "Content-Type": "multipart/mixed;boundary=BOUNDARY",
              Accept: "multipart/mixed",
            },
            "PAYLOAD",
            true
          )
        );
        assert.equal(error, "ERROR");
      });
    });
  });

  it(".put()", function () {
    sinon.stub(agent, "sendRequest").returns("PROMISE");
    assert.equal(agent.put("INPUT_PATH", "HEADERS", "PAYLOAD"), "PROMISE");
    assert.ok(
      agent.sendRequest.calledWith("PUT", "INPUT_PATH", "HEADERS", "PAYLOAD")
    );
  });

  it(".merge()", function () {
    sinon.stub(agent, "sendRequest").returns("PROMISE");
    assert.equal(agent.merge("INPUT_PATH", "HEADERS", "PAYLOAD"), "PROMISE");
    assert.ok(
      agent.sendRequest.calledWith("MERGE", "INPUT_PATH", "HEADERS", "PAYLOAD")
    );
  });

  it(".patch()", function () {
    sinon.stub(agent, "sendRequest").returns("PROMISE");
    assert.equal(agent.patch("INPUT_PATH", "HEADERS", "PAYLOAD"), "PROMISE");
    assert.ok(
      agent.sendRequest.calledWith("PATCH", "INPUT_PATH", "HEADERS", "PAYLOAD")
    );
  });

  it(".get()", function () {
    sinon.stub(agent, "sendRequest").returns("PROMISE");
    assert.equal(agent.get("INPUT_PATH", "HEADERS", "ARG1", "ARG2"), "PROMISE");
    assert.ok(
      agent.sendRequest.calledWithExactly(
        "GET",
        "INPUT_PATH",
        "HEADERS",
        "ARG1",
        "ARG2"
      )
    );
  });

  describe(".initializeLogger()", function () {
    it("Create implicit logger", function () {
      let logger = agent.initializeLogger({});
      assert.ok(_.isFunction(logger.trace));
      assert.ok(_.isFunction(logger.debug));
      assert.ok(_.isFunction(logger.info));
      assert.ok(_.isFunction(logger.warn));
      assert.ok(_.isFunction(logger.error));
    });
    it("Create implicit logger", function () {
      let logger = {
        trace: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
      assert.strictEqual(
        agent.initializeLogger({
          logger: logger,
        }),
        logger
      );
    });
    it("Raise exception for invalid logger", function () {
      let logger = {};
      assert.throws(() => {
        agent.initializeLogger({
          logger: logger,
        });
      });
    });
  });

  describe(".fetchToken()", function () {
    let headers;
    beforeEach(() => {
      headers = {
        get: sinon.stub().withArgs("x-csrf-token").returns("X_CSRF_TOKEN"),
      };
      sinon.stub(agent.logger, "info");
      sandbox.stub(agentUrl, "normalize").returns("NORMALIZED_URL");
      sinon.stub(agent, "fetch").returns(
        Promise.resolve({
          headers: headers,
        })
      );
    });
    it("Fetch token from backend", function () {
      return agent.fetchToken().then((token) => {
        assert.ok(agent.logger.info.calledTwice);
        assert.equal(token, "X_CSRF_TOKEN");
      });
    });
    it("Use cached token", function () {
      return agent
        .fetchToken()
        .then(function () {
          agent.logger.info.reset();
          agent.fetch.reset();
          return agent.fetchToken();
        })
        .then(function (token) {
          assert.equal(token, "X_CSRF_TOKEN");
          assert.ok(agent.fetch.notCalled);
        });
    });
  });

  describe(".normalizeBatchResponse", () => {
    it("Returns parsed particular OData responses.", () => {
      agent.setServiceVersion("1.0");
      const response1 = {
        plain: sinon.stub().returns([]),
      };
      const response2 = {
        plain: sinon.stub().returns({}),
      };
      return agent
        .normalizeBatchResponse("BATCH_RESPONSE", [response1, response2], false)
        .then((response) => {
          assert.deepEqual(response, [[], {}]);
          assert.ok(
            response1.plain.calledWithExactly(
              agent._listResultPath,
              agent._instanceResultPath
            )
          );
          assert.ok(
            response2.plain.calledWithExactly(
              agent._listResultPath,
              agent._instanceResultPath
            )
          );
        });
    });
    it("Returns batch responses with full particular responses.", () => {
      agent.setServiceVersion("1.0");
      return agent
        .normalizeBatchResponse({}, ["RESPONSE_1", "RESPONSE_2"], true)
        .then((response) => {
          assert.deepEqual(response, {
            batchResponses: ["RESPONSE_1", "RESPONSE_2"],
          });
        });
    });
    it("Normalize batch responses contains Error response.", () => {
      agent.setServiceVersion("1.0");
      const response1 = {
        plain: sinon.stub().returns([]),
      };
      return agent
        .normalizeBatchResponse(
          "BATCH_RESPONSE",
          [response1, new Error()],
          false
        )
        .then((result) => {
          assert.ok(result[1] instanceof Error);
        });
    });
  });

  describe(".getResultPath", function () {
    let result;
    beforeEach(function () {
      result = {
        d: {
          results: "RESULTS",
        },
      };
      agent.setServiceVersion("1.0");
    });
    it("SAP list result path v1", function () {
      assert.strictEqual(agent.getResultPath(true, result), "d.results");
    });
    it("SAP object result path v1", function () {
      assert.strictEqual(agent.getResultPath(false, result), "d");
    });
    it("MS list result path v1", function () {
      result.d = "RESULTS";
      assert.strictEqual(agent.getResultPath(true, result), "d");
    });
    it("List result path v4", function () {
      result.value = "RESULTS";
      agent = new Agent({
        url: "URL",
      });
      agent.setServiceVersion("4.0");
      assert.strictEqual(agent.getResultPath(true, result), "value");
    });
    it("Object result path v4", function () {
      result.value = "RESULTS";
      agent = new Agent({
        url: "URL",
      });
      agent.setServiceVersion("4.0");
      assert.strictEqual(agent.getResultPath(false, result), "");
    });
  });

  describe(".setServiceVersion", function () {
    it("invalid version", function () {
      assert.throws(function () {
        agent.setServiceVersion(null);
      });
    });
    it("paths for version 1", function () {
      agent.setServiceVersion("1.0");
      assert.equal(agent._listResultPath, "d.results");
      assert.equal(agent._instanceResultPath, "d");
    });
    it("paths for version 4", function () {
      agent.setServiceVersion("4.0");
      assert.equal(agent._listResultPath, "value");
      assert.equal(agent._instanceResultPath, "");
    });
  });

  describe(".fetch", function () {
    let opts;
    beforeEach(function () {
      sinon.stub(agent, "readCookies").returns(Promise.resolve("COOKIES"));
      sinon.stub(agent, "appendHeaders");
      sandbox.stub(log, "logRequest");
      nodeFetch.returns(Promise.resolve("RESPONSE"));
      sinon.stub(agent, "saveCookies").returns(Promise.resolve());
      sinon.stub(agent, "isResponseRedirect");
      sinon.stub(agent, "redirect").returns(Promise.resolve());
      sinon.stub(agent, "processResponse").returns(Promise.resolve());
      opts = {};
      agent.setAuthorizationHeaders({ "x-csrf-token": "X-CSRF-TOKEN" });
    });
    it("invalid options", function () {
      assert.throws(function () {
        agent.fetch("URL", null);
      });
    });
    it("use fetch to handle normal http request ", function () {
      return agent.fetch("URL", opts).then(function () {
        assert.ok(agent.readCookies.calledWithExactly("URL"));
        assert.ok(
          agent.appendHeaders.calledWithExactly(
            {
              Cookie: "COOKIES",
            },
            opts
          )
        );
        assert.ok(
          agent.appendHeaders.calledWithExactly(
            { "x-csrf-token": "X-CSRF-TOKEN" },
            opts
          )
        );
        assert.equal(log.logRequest.getCall(0).args[0], agent.logger);
        assert.ok(_.isNumber(log.logRequest.getCall(0).args[1]));
        assert.deepEqual(log.logRequest.getCall(0).args.slice(2), [
          "URL",
          opts,
        ]);
        assert.ok(nodeFetch.calledWithExactly("URL", { redirect: "manual" }));
        assert.ok(agent.saveCookies.calledWithExactly("RESPONSE"));
        assert.ok(
          agent.isResponseRedirect.calledWithExactly(
            "RESPONSE",
            undefined,
            false
          )
        );
        assert.ok(agent.redirect.notCalled);
        assert.ok(_.isNumber(agent.processResponse.getCall(0).args[0]));
        assert.deepEqual(agent.processResponse.getCall(0).args.slice(1), [
          "URL",
          opts,
          "RESPONSE",
        ]);
      });
    });
    it("use fetch to handle redirect", function () {
      agent.isResponseRedirect.returns(true);
      return agent.fetch("URL", opts).then(function () {
        assert.ok(agent.readCookies.calledWithExactly("URL"));
        assert.ok(
          agent.appendHeaders.calledWithExactly(
            {
              Cookie: "COOKIES",
            },
            opts
          )
        );
        assert.ok(
          agent.appendHeaders.calledWithExactly(
            { "x-csrf-token": "X-CSRF-TOKEN" },
            opts
          )
        );
        assert.equal(log.logRequest.getCall(0).args[0], agent.logger);
        assert.ok(_.isNumber(log.logRequest.getCall(0).args[1]));
        assert.deepEqual(log.logRequest.getCall(0).args.slice(2), [
          "URL",
          opts,
        ]);
        assert.ok(nodeFetch.calledWithExactly("URL", { redirect: "manual" }));
        assert.ok(agent.saveCookies.calledWithExactly("RESPONSE"));
        assert.ok(
          agent.isResponseRedirect.calledWithExactly(
            "RESPONSE",
            undefined,
            false
          )
        );
        assert.ok(agent.processResponse.notCalled);
        assert.ok(_.isNumber(agent.redirect.getCall(0).args[0]));
        assert.deepEqual(agent.redirect.getCall(0).args.slice(1), [
          "URL",
          opts,
          "RESPONSE",
        ]);
      });
    });
  });

  describe(".processResponse", function () {
    let response;
    beforeEach(function () {
      response = {
        status: 400,
        text: sinon.stub().returns(Promise.resolve("ERROR_DESCRIPTION")),
        statusText: "STATUS_TEXT",
      };
    });
    it("correct responsed", function () {
      response.status = 200;
      sandbox.stub(log, "logResponse");
      return agent
        .processResponse("COUNTER", "requestUrl", "OPTS", response)
        .then((result) => {
          assert.deepEqual(
            result,
            _.assign(
              {
                requestCounter: "COUNTER",
              },
              response
            )
          );
          assert.ok(
            log.logResponse.calledWithExactly(
              agent.logger,
              "COUNTER",
              "requestUrl",
              "OPTS"
            )
          );
        });
    });
    it("response with error status code", function () {
      sandbox.stub(log, "logResponse");
      return agent
        .processResponse("COUNTER", "requestUrl", "OPTS", response)
        .catch((err) => {
          assert.equal(err.name, "STATUS_TEXT");
          assert.equal(err.message, "ERROR_DESCRIPTION");
          assert.equal(err.status, 400);
          assert.ok(
            log.logResponse.calledWithExactly(
              agent.logger,
              "COUNTER",
              "requestUrl",
              "OPTS"
            )
          );
        });
    });
    it("error response without body content", function () {
      sandbox.stub(log, "logResponse");
      response.text.returns(Promise.resolve(undefined));
      return agent
        .processResponse("COUNTER", "requestUrl", "OPTS", response)
        .catch((err) => {
          assert.equal(err.name, "STATUS_TEXT");
          assert.equal(err.message, "STATUS_TEXT");
          assert.equal(err.status, 400);
          assert.ok(
            log.logResponse.calledWithExactly(
              agent.logger,
              "COUNTER",
              "requestUrl",
              "OPTS"
            )
          );
        });
    });
  });

  describe(".redirect", function () {
    let response;
    beforeEach(function () {
      response = {
        headers: {
          get: sinon.stub().returns("LOCATION"),
        },
      };
      sinon.stub(agent, "fetch").returns("FETCH_PROMISE");
      sandbox.stub(log, "logResponse");
    });
    it("normally processs HTTP request with redirect", function () {
      assert.equal(
        agent.redirect("COUNTER", "URL", "OPTS", response),
        "FETCH_PROMISE"
      );
      assert.ok(
        log.logResponse.calledWithExactly(
          agent.logger,
          "COUNTER",
          "URL",
          "OPTS",
          response
        )
      );
      assert.ok(
        agent.fetch.calledWithExactly(
          "LOCATION",
          {
            method: "GET",
            body: null,
          },
          true
        )
      );
    });
    it("processs HTTP redirect with follow option ", function () {
      assert.equal(
        agent.redirect("COUNTER", "URL", { follow: 1 }, response),
        "FETCH_PROMISE"
      );
      assert.ok(
        log.logResponse.calledWithExactly(
          agent.logger,
          "COUNTER",
          "URL",
          { follow: 1 },
          response
        )
      );
      assert.ok(
        agent.fetch.calledWithExactly(
          "LOCATION",
          {
            method: "GET",
            body: null,
            follow: 0,
          },
          true
        )
      );
    });
    it("processs HTTP temporary redirect with follow option ", function () {
      response.status = 307;
      assert.equal(
        agent.redirect("COUNTER", "URL", { follow: 1 }, response),
        "FETCH_PROMISE"
      );
      assert.ok(
        log.logResponse.calledWithExactly(
          agent.logger,
          "COUNTER",
          "URL",
          { follow: 1 },
          response
        )
      );
      assert.ok(
        agent.fetch.calledWithExactly(
          "LOCATION",
          {
            follow: 0,
          },
          true
        )
      );
    });
  });

  describe(".readCookies", function () {
    let promise;
    it("read cookies with url as string", function () {
      promise = agent.readCookies("URL");
      assert.ok(agent.cookieJar.getCookieString.calledWith("URL"));
      agent.cookieJar.getCookieString.getCall(0).args[1](null, "COOKIES");
      return promise.then((cookies) => {
        assert.equal(cookies, "COOKIES");
      });
    });
    it("read cookies with url as HTTP response", function () {
      promise = agent.readCookies({
        url: "URL",
      });
      assert.ok(agent.cookieJar.getCookieString.calledWith("URL"));
      agent.cookieJar.getCookieString.getCall(0).args[1](null, "COOKIES");
      return promise.then((cookies) => {
        assert.equal(cookies, "COOKIES");
      });
    });
    it("read cookies rejected", function () {
      promise = agent.readCookies({
        url: "URL",
      });
      assert.ok(agent.cookieJar.getCookieString.calledWith("URL"));
      agent.cookieJar.getCookieString.getCall(0).args[1]("ERROR", "COOKIES");
      return promise.catch((err) => {
        assert.equal(err, "ERROR");
      });
    });
  });

  it(".isResponseRedirect", function () {
    assert.equal(
      agent.isResponseRedirect(
        {
          status: 200,
        },
        0,
        true
      ),
      false
    );
    assert.equal(
      agent.isResponseRedirect(
        {
          status: 303,
        },
        0,
        true
      ),
      false
    );
    assert.equal(
      agent.isResponseRedirect(
        {
          status: 303,
        },
        1,
        true
      ),
      false
    );
    assert.equal(
      agent.isResponseRedirect(
        {
          status: 303,
        },
        1,
        false
      ),
      true
    );
  });

  describe(".appendHeaders", function () {
    let opts;
    let headers = {
      Cookie: "COOKIE",
      "x-csrf-token": "TOKEN",
      foo: null,
    };
    beforeEach(function () {
      opts = {
        headers: {
          append: sinon.stub(),
        },
      };
    });
    it("invalid parameters passed", function () {
      agent.appendHeaders();
      agent.appendHeaders({});
      agent.appendHeaders(undefined, opts);
      assert.ok(opts.headers.append.notCalled);
    });
    it("headers object is symbol list", function () {
      agent.appendHeaders(headers, opts);
      assert.ok(opts.headers.append.calledWithExactly("Cookie", "COOKIE"));
      assert.ok(opts.headers.append.calledWithExactly("x-csrf-token", "TOKEN"));
      assert.ok(opts.headers.append.calledTwice);
    });
    it("headers object is plain object", function () {
      opts.headers = {
        foo: "BAR",
      };
      agent.appendHeaders(headers, opts);
      assert.deepEqual(opts.headers, {
        Cookie: "COOKIE",
        "x-csrf-token": "TOKEN",
        foo: "BAR",
      });
    });
    it("headers object is not defined", function () {
      delete opts.headers;

      agent.appendHeaders(headers, opts);
      assert.deepEqual(opts.headers, {
        Cookie: "COOKIE",
        "x-csrf-token": "TOKEN",
      });
    });
  });

  describe(".saveCookies", function () {
    let response;
    beforeEach(function () {
      response = {
        url: "URL",
        headers: {
          raw: sinon.stub().returns({}),
        },
      };
    });
    it("cookie header is not exists", function () {
      return agent.saveCookies(response).then(() => {
        assert.ok(tough.CookieJar().setCookie.notCalled);
      });
    });
    it("cookie header exists", function () {
      let promise;
      response.headers.raw.returns({ "set-cookie": ["COOKIE1", "COOKIE2"] });
      promise = agent.saveCookies(response);
      tough.CookieJar().setCookie.getCall(0).args[2](null, "COOKIE1");
      tough.CookieJar().setCookie.getCall(1).args[2](null, "COOKIE2");

      return promise.then((result) => {
        assert.deepEqual(result, ["COOKIE1", "COOKIE2"]);
        assert.ok(tough.CookieJar().setCookie.calledWith("COOKIE1", "URL"));
        assert.ok(tough.CookieJar().setCookie.calledWith("COOKIE2", "URL"));
      });
    });
    it("cookie saving raises error", function () {
      let promise;
      response.headers.raw.returns({ "set-cookie": ["COOKIE1", "COOKIE2"] });
      promise = agent.saveCookies(response);
      tough.CookieJar().setCookie.getCall(0).args[2](null, "COOKIE1");
      tough.CookieJar().setCookie.getCall(1).args[2]("ERROR");

      return promise.catch((err) => {
        assert.equal(err, "ERROR");
        assert.ok(tough.CookieJar().setCookie.calledWith("COOKIE1", "URL"));
        assert.ok(tough.CookieJar().setCookie.calledWith("COOKIE2", "URL"));
      });
    });
  });

  describe(".setAuthorizationHeaders", function () {
    it("Invalid authorization header", function () {
      assert.throws(function () {
        agent.setAuthorizationHeaders(null);
      });
      assert.throws(function () {
        agent.setAuthorizationHeaders("AUTH");
      });
    });
    it("Correctly set authorization header", function () {
      agent.setAuthorizationHeaders({ "x-csrf-token": "X_CSRF_TOKEN" });
    });
  });
});
