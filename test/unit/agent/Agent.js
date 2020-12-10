"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const _ = require("lodash");

function getSampleMetadataResponse() {
  return Promise.resolve({
    body: {
      "edmx:Edmx": {
        "edmx:DataServices": [
          {
            Schema: [
              {
                EntityContainer: {},
                Annotations: [{}],
              },
            ],
          },
        ],
      },
    },
  });
}

describe("Agent", function () {
  let Agent;
  let superagent;
  let innerAgent;
  let agent;
  let url;
  let authenticatorNone, authenticatorBasic, authenticatorSamlSap;

  beforeEach(function () {
    innerAgent = sinon.stub();
    superagent = {
      agent: sinon.stub().returns(innerAgent),
    };
    url = {};
    authenticatorNone = sinon.stub();
    authenticatorBasic = sinon.stub();
    authenticatorSamlSap = sinon.stub();

    Agent = proxyquire("../../../lib/agent/Agent", {
      superagent: superagent,
      "./url": url,
      "./authentication/none": authenticatorNone,
      "./authentication/basic": authenticatorBasic,
      "./authentication/samlSap": authenticatorSamlSap,
    });
    agent = new Agent({
      url: "URL",
    });
    agent.setServiceVersion("1.0");
  });

  describe("#constructor()", function () {
    it("Properties are initialized", function () {
      assert.deepEqual(agent.settings, {
        url: "URL",
      });
      assert.strictEqual(agent.superagent, innerAgent);
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
    it("Read core metadata only", function () {
      sinon.stub(agent, "metadataSearch").returns("PARAMETERS");
      sinon.stub(agent, "authenticate").returns(Promise.resolve());
      sinon.stub(agent, "createMetadataRequest").returns(
        Promise.resolve({
          body: "RESPONSE_BODY",
        })
      );
      url.appendSearch = (a, b) => `${a}?${b}`;

      return agent.metadata().then((responses) => {
        assert.deepEqual(responses, ["RESPONSE_BODY"]);
        assert.ok(agent.createMetadataRequest.calledOnce);
        assert.ok(
          agent.createMetadataRequest.getCall(0).args[0],
          "URL/$metadata?PARAMETERS"
        );
        assert.equal(
          agent.authenticate.getCall(0).args[0],
          "URL/$metadata?PARAMETERS"
        );
      });
    });
    it("Read core metadata and annotations metadata", function () {
      sinon.stub(agent, "metadataSearch").returns("PARAMETERS");
      sinon.stub(agent, "authenticate").returns(Promise.resolve());
      sinon
        .stub(agent, "createMetadataRequest")
        .onCall(0)
        .returns(
          Promise.resolve({
            body: "METADATA_RESPONSE_BODY",
          })
        );
      agent.createMetadataRequest.onCall(1).returns(
        Promise.resolve({
          body: "ANNOTATIONS_RESPONSE_BODY",
        })
      );
      url.appendSearch = sinon
        .stub()
        .returns("ANNOTATIONS_URL_WITH_PARAMETERS");
      agent.settings.annotationsUrl = "ANNOTATIONS_URL";

      return agent.metadata().then((responses) => {
        assert.deepEqual(responses, [
          "METADATA_RESPONSE_BODY",
          "ANNOTATIONS_RESPONSE_BODY",
        ]);
        assert.ok(agent.createMetadataRequest.calledTwice);
        assert.equal(
          agent.authenticate.getCall(0).args[0],
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
        assert.equal(url.appendSearch.getCall(0).args[0], "ANNOTATIONS_URL");
        assert.equal(url.appendSearch.getCall(0).args[1], "PARAMETERS");
      });
    });
  });

  describe(".createMetadataRequest()", function () {
    it("Successfull request", function () {
      sinon.stub(agent, "logResponse");
      sinon.stub(agent, "logRequest");
      innerAgent.get = sinon.stub().returns({
        buffer: sinon.stub().returns(getSampleMetadataResponse()),
      });
      return agent.createMetadataRequest("metadataUrl").then(() => {
        assert.ok(innerAgent.get.calledWith("metadataUrl"));
        assert.ok(innerAgent.get().buffer.calledWith(true));
        assert.ok(agent.logRequest.calledWithExactly("metadataUrl", "GET"));
      });
    });
    it("Process invalid request", function () {
      sinon.stub(agent, "logResponse");
      sinon.stub(agent, "logRequest");
      sinon.stub(Agent, "formatResponseError").returns("FORMATTED_ERROR");
      innerAgent.get = sinon.stub().returns({
        buffer: sinon.stub().returns(Promise.reject("ERROR")),
      });
      return agent.createMetadataRequest("metadataUrl").catch((err) => {
        assert.ok(Agent.formatResponseError.calledWith("ERROR"));
        assert.equal(err, "FORMATTED_ERROR");
        Agent.formatResponseError.restore();
      });
    });
  });

  describe(".initializeAgent()", function () {
    it("Initialize without ca", function () {
      innerAgent.ca = sinon.stub();
      agent.initializeAgent({
        url: "URL",
      });
      assert.ok(innerAgent.ca.notCalled);
    });
    it("Initialize with auth", function () {
      innerAgent.ca = sinon.stub();
      agent.initializeAgent({
        url: "URL",
        ca: "CA_PATH",
      });
      assert.ok(innerAgent.ca.getCall(0).calledWithExactly("CA_PATH"));
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
      url.normalize = sinon.stub();
      url.normalize.returns("NORMALIZED_PATH");

      sinon.spy(agent.logger, "info");
      sinon
        .stub(agent, "headersToRequest")
        .returns(Promise.resolve("RESPONSE"));
      sinon.stub(agent, "logResponse");
      innerAgent.post = sinon.stub();
    });
    it("Envelope superagent request with payload", function () {
      let postRequest = {
        send: sinon.stub().returns("SUPERAGENT_POST_PROMISE"),
        buffer: sinon.stub(),
      };

      innerAgent.post.returns(postRequest);

      return agent
        .sendRequest("POST", "INPUT_PATH", "HEADERS", "PAYLOAD")
        .then((res) => {
          assert.equal(res, "RESPONSE");
          assert.ok(innerAgent.post.calledWith("NORMALIZED_PATH"));
          assert.ok(postRequest.send.calledWith("PAYLOAD"));
          assert.ok(agent.headersToRequest.calledWith("HEADERS", postRequest));
          assert.deepEqual(url.normalize.getCall(0).args, [
            "INPUT_PATH",
            "URL",
          ]);
          assert.ok(agent.logResponse.calledWith("RESPONSE"));
          assert.ok(postRequest.buffer.calledWithExactly(false));
        });
    });
    it("Envelope superagent request without payload", function () {
      let postRequest = {
        buffer: sinon.stub(),
      };
      innerAgent.post.returns(postRequest);

      return agent
        .sendRequest("POST", "INPUT_PATH", "HEADERS", undefined, true)
        .then((res) => {
          assert.equal(res, "RESPONSE");
          assert.ok(innerAgent.post.calledWith("NORMALIZED_PATH"));
          assert.ok(agent.headersToRequest.calledWith("HEADERS", postRequest));
          assert.deepEqual(url.normalize.getCall(0).args, [
            "INPUT_PATH",
            "URL",
          ]);
          assert.ok(agent.logResponse.calledWith("RESPONSE"));
          assert.ok(postRequest.buffer.calledWithExactly(true));
        });
    });
    it("Error response from superagent request", function () {
      let postRequest = {
        buffer: sinon.stub(),
      };
      innerAgent.post.returns(postRequest);
      sinon.stub(Agent, "formatResponseError").returns("FORMATTED_ERROR");
      agent.headersToRequest.returns(Promise.reject("ERROR"));

      return agent.sendRequest("POST", "INPUT_PATH", "HEADERS").catch((err) => {
        assert.equal(err, "FORMATTED_ERROR");
        assert.ok(innerAgent.post.calledWith("NORMALIZED_PATH"));
        assert.ok(agent.headersToRequest.calledWith("HEADERS", postRequest));
        assert.deepEqual(url.normalize.getCall(0).args, ["INPUT_PATH", "URL"]);
        assert.ok(Agent.formatResponseError.calledWith("ERROR"));
        Agent.formatResponseError.restore();
        assert.ok(postRequest.buffer.calledWithExactly(false));
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
        assert.ok(_.isFunction(promiseBatch.request._parser));
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
        assert.ok(_.isFunction(promiseBatch.request._parser));
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

  describe("#enhanceError()", function () {
    it("Process non superagent error", function () {
      assert.ok(Agent.formatResponseError({}) instanceof Error);
    });
    it("Process response error", function () {
      sinon.stub(Agent, "parseNetweaverErrorMessage");
      assert.ok(
        Agent.formatResponseError({
          response: {
            error: {
              message: "ERROR",
            },
            request: {
              url: "URL",
              header: {
                HEADER: "VALUE",
              },
              cookies: "COOKIE1=VALUE1;COOKIE2=VALUE2",
            },
          },
        }) instanceof Error
      );
      assert.ok(Agent.parseNetweaverErrorMessage.calledWith("ERROR"));
      Agent.parseNetweaverErrorMessage.restore();
    });
    it("Process response text", function () {
      sinon.stub(Agent, "parseNetweaverErrorMessage").returns("PARSED_MESSAGE");
      assert.ok(
        Agent.formatResponseError({
          response: {
            text: "ERROR",
            request: {
              url: "URL",
              header: {
                HEADER: "VALUE",
              },
              cookies: "COOKIE1=VALUE1;COOKIE2=VALUE2",
            },
          },
        }) instanceof Error
      );
      assert.ok(Agent.parseNetweaverErrorMessage.calledWith("ERROR"));
      Agent.parseNetweaverErrorMessage.restore();
    });
    it("Process response text", () => {
      sinon.stub(Agent, "parseNetweaverErrorMessage");
      assert.ok(
        Agent.formatResponseError({
          response: {
            request: {
              url: "URL",
              header: {
                HEADER: "VALUE",
              },
              cookies: "COOKIE1=VALUE1;COOKIE2=VALUE2",
            },
          },
        }) instanceof Error
      );
      assert.ok(Agent.parseNetweaverErrorMessage.calledWith(""));
      Agent.parseNetweaverErrorMessage.restore();
    });
  });

  describe("#parseNetweaverErrorMessage()", function () {
    it("Process JSON message", function () {
      let responseError = JSON.stringify({
        error: {
          message: {
            value: "MESSAGE",
          },
        },
      });
      assert.equal(
        Agent.parseNetweaverErrorMessage(responseError),
        `MESSAGE\n\n${JSON.stringify(
          { error: { message: { value: "MESSAGE" } } },
          null,
          2
        )}`
      );
    });
    it("Process unidentified response", function () {
      let responseError = JSON.stringify({
        error: {
          messageText: {
            value: "MESSAGE",
          },
        },
      });
      assert.equal(Agent.parseNetweaverErrorMessage(undefined), undefined);
      assert.equal(
        Agent.parseNetweaverErrorMessage(responseError),
        JSON.stringify(
          {
            error: {
              messageText: {
                value: "MESSAGE",
              },
            },
          },
          null,
          2
        )
      );
      assert.equal(
        Agent.parseNetweaverErrorMessage("<xmlerror>ERROR</xmlerror>"),
        "<xmlerror>ERROR</xmlerror>"
      );
    });
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
    beforeEach(() => {
      sinon.stub(agent.logger, "info");
      sinon.stub(agent, "sendRequest").returns(
        Promise.resolve({
          headers: {
            "x-csrf-token": "X_CSRF_TOKEN",
          },
        })
      );
    });
    it("Fetch token from backend", function () {
      return agent.fetchToken().then(function () {
        assert.ok(agent.logger.info.calledTwice);
        assert.ok(agent.sendRequest.calledWith("GET", "/"));
        assert.equal(agent.csrfToken, "X_CSRF_TOKEN");
      });
    });
    it("Use cached token", function () {
      return agent
        .fetchToken()
        .then(function () {
          agent.logger.info.reset();
          agent.sendRequest.reset();
          return agent.fetchToken();
        })
        .then(function () {
          assert.ok(agent.logger.info.notCalled);
          assert.ok(agent.sendRequest.notCalled);
        });
    });
  });

  describe(".authenticate", function () {
    it("if authenticators does not exists raise error.", function () {
      sinon.stub(Agent, "authenticators").value(null);
      return agent
        .authenticate("URL")
        .then(() => assert.ok(false))
        .catch((err) => assert.ok(err.message.match(/not defined/)));
    });
    it("if authenticators are empty raise error.", function () {
      sinon.stub(Agent, "authenticators").value([]);
      return agent
        .authenticate("URL")
        .then(() => assert.ok(false))
        .catch((err) => assert.ok(err.message.match(/not defined/)));
    });
    it("Initialize authenticating by first authenticator with correct authentication", function () {
      let promise;
      sinon.stub(agent, "tryAuthenticator");
      sinon.stub(agent.logger, "debug");
      sinon.stub(Agent, "authenticators").value(["./authentication/none"]);
      authenticatorNone.returns("AUTHENTICATOR");
      promise = agent.authenticate("URL").then(() => {
        assert.ok(agent.tryAuthenticator.calledOnce);
        assert.ok(agent.tryAuthenticator.calledWith(1, "URL", "AUTHENTICATOR"));
        assert.deepEqual(authenticatorNone.getCall(0).args, [
          {
            url: "URL",
          },
          innerAgent,
          "URL",
        ]);
      });

      setTimeout(() => {
        agent.tryAuthenticator.getCall(0).args[3]();
      }, 0);
      return promise;
    });
    it("Initialize authenticating by first authenticator but all authenticators failed", function () {
      let promise;
      sinon.stub(agent, "tryAuthenticator");
      sinon.stub(agent.logger, "debug");
      sinon.stub(Agent, "authenticators").value(["./authentication/none"]);
      authenticatorNone.returns("AUTHENTICATOR");
      promise = agent
        .authenticate("URL")
        .then(() => assert.ok(false))
        .catch(() => {
          assert.ok(agent.tryAuthenticator.calledOnce);
          assert.ok(
            agent.tryAuthenticator.calledWith(1, "URL", "AUTHENTICATOR")
          );
          assert.deepEqual(authenticatorNone.getCall(0).args, [
            {
              url: "URL",
            },
            innerAgent,
            "URL",
          ]);
        });

      setTimeout(() => {
        agent.tryAuthenticator.getCall(0).args[4]();
      }, 0);
      return promise;
    });
  });

  describe(".tryAuthenticator", function () {
    it("Succeed on first authenticator", function (done) {
      sinon.stub(agent.logger, "debug");
      authenticatorSamlSap.authenticatorName = "AUTHENTICATOR";
      agent.tryAuthenticator(1, "URL", Promise.resolve("RESPONSE"), function (
        response
      ) {
        assert.equal(response, "RESPONSE");
        assert.ok(agent.logger.debug.getCall(0).args[0].match(/AUTHENTICATOR/));
        done();
      });
    });
    it("Succeed on next authenticator", function (done) {
      sinon.stub(agent.logger, "warn");
      sinon.stub(agent.logger, "debug");
      authenticatorSamlSap.authenticatorName = "FIRST_AUTHENTICATOR";
      authenticatorBasic.returns(Promise.resolve("RESPONSE"));
      authenticatorBasic.authenticatorName = "SECOND_AUTHENTICATOR";

      agent.tryAuthenticator(
        1,
        "URL",
        Promise.reject({
          message: "ERROR",
          unsupported: true,
        }),
        function () {
          assert.ok(
            agent.logger.debug.getCall(0).args[0].match(/SECOND_AUTHENTICATOR/)
          );
          assert.ok(
            agent.logger.warn.getCall(0).args[0].match(/FIRST_AUTHENTICATOR/)
          );
          assert.ok(
            agent.logger.debug.getCall(1).args[0].match(/SECOND_AUTHENTICATOR/)
          );
          done();
        }
      );
    });
    it("Fails on all authenticators", function (done) {
      sinon.stub(agent.logger, "warn");
      sinon.stub(agent.logger, "debug");
      authenticatorBasic.returns(
        Promise.reject({
          message: "ERROR MESSAGE",
          unsupported: true,
        })
      );
      authenticatorNone.returns(
        Promise.reject({
          message: "ERROR MESSAGE",
          unsupported: true,
        })
      );

      agent.tryAuthenticator(
        1,
        "URL",
        Promise.reject({
          message: "ERROR",
          unsupported: true,
        }),
        null,
        function (error) {
          assert.equal(
            error.message,
            "Not valid authenticator found - ERROR MESSAGE."
          );
          done();
        }
      );
    });
    it("Stops if rejection is fatal", function (done) {
      sinon.stub(agent.logger, "warn");
      sinon.stub(agent.logger, "debug");
      sinon.stub(agent, "fatalAuthenticateError").returns("FATAL_ERROR");

      agent.tryAuthenticator(
        1,
        "URL",
        Promise.reject("Internet is down!"),
        null,
        function (error) {
          assert.equal(error, "FATAL_ERROR");
          done();
        }
      );
    });
    it("Error handler is permissive", function (done) {
      sinon.stub(agent.logger, "warn");
      sinon.stub(agent.logger, "debug");
      authenticatorBasic.returns(Promise.resolve("RESPONSE"));

      agent.tryAuthenticator(
        1,
        "URL",
        Promise.reject({
          response: {
            forbidden: false,
          },
        }),
        function (response) {
          assert.equal(response, "RESPONSE");
          done();
        }
      );
    });
  });

  describe(".fatalAuthenticateError", function () {
    it("No error for non-fatal issue", function () {
      assert.strictEqual(
        agent.fatalAuthenticateError({
          unsupported: true,
        }),
        undefined
      );
    });
    it("No network connection.", function () {
      let err = agent.fatalAuthenticateError(
        {},
        {
          authenticatorName: "AUTHENTICATOR_NAME",
        }
      );
      assert.ok(err instanceof Error);
      assert.ok(err.message.indexOf("AUTHENTICATOR_NAME") > -1);
    });
    it("Forbidden respons", function () {
      let err = agent.fatalAuthenticateError(
        {
          response: {
            forbidden: true,
            res: {
              text: "FORBIDDEN",
            },
          },
        },
        {
          authenticatorName: "AUTHENTICATOR_NAME",
        }
      );
      assert.ok(err instanceof Error);
      assert.ok(err.message.indexOf("AUTHENTICATOR_NAME") > -1);
      assert.ok(err.message.indexOf("FORBIDDEN") > -1);
    });
    it("Internal server error response", function () {
      let err = agent.fatalAuthenticateError(
        {
          response: {
            serverError: true,
            res: {
              text: "SERVER_ERROR",
            },
          },
        },
        {
          authenticatorName: "AUTHENTICATOR_NAME",
        }
      );
      assert.ok(err instanceof Error);
      assert.ok(err.message.indexOf("AUTHENTICATOR_NAME") > -1);
      assert.ok(err.message.indexOf("SERVER_ERROR") > -1);
    });
  });

  describe(".normalizeBatchResponse", function () {
    it("Returns parsed particular OData responses.", function () {
      assert.deepEqual(
        agent.normalizeBatchResponse(
          "BATCH_RESPONSE",
          [
            {
              body: {
                d: {
                  results: [],
                },
              },
            },
            {
              body: {
                d: {},
              },
            },
          ],
          false
        ),
        [[], {}]
      );
    });
    it("Returns batch responses with full particular responses.", function () {
      assert.deepEqual(
        agent.normalizeBatchResponse({}, ["RESPONSE_1", "RESPONSE_2"], true),
        {
          batchResponses: ["RESPONSE_1", "RESPONSE_2"],
        }
      );
    });
    it("Returns parsed OData responses in changeSet.", function () {
      assert.deepEqual(
        agent.normalizeBatchResponse(
          "BATCH_RESPONSE",
          [
            [
              {
                body: {
                  d: {
                    results: [],
                  },
                },
              },
              {
                body: {
                  d: {},
                },
              },
            ],
          ],
          false
        ),
        [[], {}]
      );
    });
  });

  describe(".getResultPath", function () {
    it("SAP list result path v1", function () {
      let result = {
        body: {
          d: {
            results: "RESULTS",
          },
        },
      };
      assert.strictEqual(agent.getResultPath(true, result), "body.d.results");
    });
    it("SAP object result path v1", function () {
      let result = {
        body: {
          d: {
            results: "RESULTS",
          },
        },
      };
      assert.strictEqual(agent.getResultPath(false, result), "body.d");
    });
    it("MS list result path v1", function () {
      let result = {
        body: {
          d: "RESULTS",
        },
      };
      assert.strictEqual(agent.getResultPath(true, result), "body.d");
    });
    it("List result path v4", function () {
      let result = {
        body: {
          value: "RESULTS",
        },
      };
      agent = new Agent({
        url: "URL",
      });
      agent.setServiceVersion("4.0");
      assert.strictEqual(agent.getResultPath(true, result), "body.value");
    });
    it("Object result path v4", function () {
      let result = {
        body: {
          value: "RESULTS",
        },
      };
      agent = new Agent({
        url: "URL",
      });
      agent.setServiceVersion("4.0");
      assert.strictEqual(agent.getResultPath(false, result), "body");
    });
  });
});
