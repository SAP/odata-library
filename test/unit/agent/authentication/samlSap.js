"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const _ = require("lodash");

describe("lib/agent/authentification/samlSap", function () {
  let authenticator;

  beforeEach(function () {
    authenticator = proxyquire(
      "../../../../lib/agent/authentication/samlSap",
      {}
    );
  });

  it("Static properties and functions are created", function () {
    assert.ok(_.isString(authenticator.authenticatorName));
    assert.ok(_.isFunction(authenticator.submitRedirectToLoginForm));
    assert.ok(_.isFunction(authenticator.submitLoginForm));
    assert.ok(_.isFunction(authenticator.submitRedirectFromLoginForm));
  });

  it("Request to endpoint is correctly loaded", function () {
    let get = sinon.stub().returns(Promise.resolve("RESPONSE_REDIRECT"));
    sinon.stub(authenticator, "isPossible").returns(true);
    sinon
      .stub(authenticator, "samlHandshake")
      .returns(Promise.resolve("RESPONSE"));

    return authenticator(
      "SETTINGS",
      {
        get: get,
      },
      "ENDPOINT_URL"
    ).then((response) => {
      assert.ok(get.calledWithExactly("ENDPOINT_URL"));
      assert.ok(
        authenticator.samlHandshake.calledWithExactly(
          "SETTINGS",
          {
            get: get,
          },
          "RESPONSE_REDIRECT"
        )
      );
      assert.equal(response, "RESPONSE");
    });
  });

  it("Request to endpoint is correctly loaded", function () {
    let get = sinon.stub().returns(Promise.resolve("RESPONSE_REDIRECT"));

    sinon.stub(authenticator, "isPossible").returns(true);
    sinon
      .stub(authenticator, "samlHandshake")
      .returns(Promise.resolve("RESPONSE"));

    return authenticator(
      "SETTINGS",
      {
        get: get,
      },
      "ENDPOINT_URL"
    ).then((response) => {
      assert.ok(get.calledWithExactly("ENDPOINT_URL"));
      assert.ok(
        authenticator.samlHandshake.calledWithExactly(
          "SETTINGS",
          {
            get: get,
          },
          "RESPONSE_REDIRECT"
        )
      );
      assert.equal(response, "RESPONSE");
    });
  });

  it("Request to endpoint is not possible", function () {
    let get = sinon.stub().returns(Promise.resolve("RESPONSE_REDIRECT"));

    sinon.stub(authenticator, "isPossible").returns(false);

    return authenticator(
      "SETTINGS",
      /*superagent*/ {
        get: get,
      },
      "ENDPOINT_URL"
    ).catch((error) => {
      assert.equal(
        error.message,
        "OData server does not support SAP - SAML authentification."
      );
      assert.ok(error.unsupported);
    });
  });

  it("Request to endpoint is rejected", function () {
    let get = sinon.stub().returns(Promise.reject("ERROR"));

    return authenticator(
      "SETTINGS",
      {
        get: get,
      },
      "ENDPOINT_URL"
    ).catch((error) => {
      assert.equal(error, "ERROR");
      assert.ok(!error.unsupported);
    });
  });

  it("Request to endpoint is rejected", function () {
    let get = sinon.stub().returns(Promise.reject("ERROR"));

    return authenticator(
      "SETTINGS",
      {
        get: get,
      },
      "ENDPOINT_URL"
    ).catch((error) => {
      assert.equal(error, "ERROR");
    });
  });

  it("isPossible", function () {
    let responseTemplate = {
      statusCode: 200,
      headers: {
        "content-type": "text/html",
        "sap-server": "true",
      },
      body:
        '<html><head></head><body><form><input name="SAMLRequest"/></form></body></html>',
    };
    _.each(
      [
        {
          response: responseTemplate,
          result: true,
        },
        {
          response: _.assign({}, responseTemplate, {
            statusCode: 404,
          }),
          result: false,
        },
        {
          response: _.merge({}, responseTemplate, {
            headers: {
              "sap-server": "false",
            },
          }),
          result: false,
        },
        {
          response: _.merge({}, responseTemplate, {
            headers: {
              "content-type": "application/xml",
            },
          }),
          result: false,
        },
        {
          response: _.merge({}, responseTemplate, {
            body:
              '<html><head></head><body><form><input name="SAMLResponse"/></form></body></html>',
          }),
          result: false,
        },
        {
          response: _.merge({}, responseTemplate, {
            body: null,
          }),
          result: false,
        },
        {
          response: undefined,
          result: false,
        },
      ],
      (testCase) => {
        assert.strictEqual(
          authenticator.isPossible(testCase.response),
          testCase.result
        );
      }
    );
  });

  describe("nextRequestUrl", function () {
    it("Correct inputs return correct URL", function () {
      assert.equal(
        authenticator.nextRequestUrl(
          "https://localhost/login",
          "https://localhost/login"
        ),
        "https://localhost/login"
      );
      assert.equal(
        authenticator.nextRequestUrl("/login", {
          request: {
            url: "https://localhost.localdomain/path/",
          },
        }),
        "https://localhost.localdomain/login"
      );
    });
    it("Incorrect inputs raises error", function () {
      assert.throws(() => {
        authenticator.nextRequestUrl(
          "://localhost/login",
          "https://localhost/login"
        );
      });
      assert.throws(() => {
        authenticator.nextRequestUrl("/login", {
          request: {
            url: "/path/",
          },
        });
      });
      assert.throws(() => {
        authenticator.nextRequestUrl("/login", null);
      });
    });
  });

  describe("samlHandshake", function () {
    it("SAML IdP accepted credentials", function () {
      sinon
        .stub(authenticator, "submitRedirectToLoginForm")
        .returns(Promise.resolve("RESPONSE_WITH_LOGIN_FORM"));
      sinon
        .stub(authenticator, "submitLoginForm")
        .returns(Promise.resolve("RESPONSE_FROM_LOGIN_FORM"));
      sinon.stub(authenticator, "checkResponseFromLoginPage").returns(true);
      sinon
        .stub(authenticator, "submitRedirectFromLoginForm")
        .returns(Promise.resolve("RESPONSE_FROM_DESTINATION_PAGE"));
      return authenticator
        .samlHandshake("SETTINGS", "AGENT", "ENDPOINT_RESPONSE")
        .then((response) => {
          assert.ok(
            authenticator.submitRedirectToLoginForm.calledWithExactly(
              "SETTINGS",
              "AGENT",
              "ENDPOINT_RESPONSE"
            )
          );
          assert.ok(
            authenticator.submitLoginForm.calledWithExactly(
              "SETTINGS",
              "AGENT",
              "RESPONSE_WITH_LOGIN_FORM"
            )
          );
          assert.ok(
            authenticator.checkResponseFromLoginPage.calledWithExactly(
              "RESPONSE_FROM_LOGIN_FORM"
            )
          );
          assert.ok(
            authenticator.submitRedirectFromLoginForm.calledWithExactly(
              "SETTINGS",
              "AGENT",
              "RESPONSE_FROM_LOGIN_FORM"
            )
          );
          assert.equal(response, "RESPONSE_FROM_DESTINATION_PAGE");
        });
    });
    it("SAML IdP rejected credentials", function () {
      let settings = {
        auth: {
          username: "USER",
        },
      };
      sinon
        .stub(authenticator, "submitRedirectToLoginForm")
        .returns(Promise.resolve("RESPONSE_WITH_LOGIN_FORM"));
      sinon
        .stub(authenticator, "submitLoginForm")
        .returns(Promise.resolve("RESPONSE_FROM_LOGIN_FORM"));
      sinon.stub(authenticator, "checkResponseFromLoginPage").returns(false);
      return authenticator
        .samlHandshake(settings, "AGENT", "ENDPOINT_RESPONSE")
        .catch((error) => {
          assert.ok(
            authenticator.submitRedirectToLoginForm.calledWithExactly(
              settings,
              "AGENT",
              "ENDPOINT_RESPONSE"
            )
          );
          assert.ok(
            authenticator.submitLoginForm.calledWithExactly(
              settings,
              "AGENT",
              "RESPONSE_WITH_LOGIN_FORM"
            )
          );
          assert.ok(
            authenticator.checkResponseFromLoginPage.calledWithExactly(
              "RESPONSE_FROM_LOGIN_FORM"
            )
          );
          assert.ok(error.message.match(/USER/));
        });
    });
    it("Destination rejected SAML token", function () {
      sinon
        .stub(authenticator, "submitRedirectToLoginForm")
        .returns(Promise.resolve("RESPONSE_WITH_LOGIN_FORM"));
      sinon
        .stub(authenticator, "submitLoginForm")
        .returns(Promise.resolve("RESPONSE_FROM_LOGIN_FORM"));
      sinon.stub(authenticator, "checkResponseFromLoginPage").returns(true);
      sinon
        .stub(authenticator, "submitRedirectFromLoginForm")
        .returns(Promise.reject("ERROR_FROM_DESTINATION_PAGE"));
      sinon.stub(authenticator, "processDestinationSystemError").callsArg(0);
      return authenticator
        .samlHandshake("SETTINGS", "AGENT", "ENDPOINT_RESPONSE")
        .catch(() => {
          assert.ok(
            authenticator.submitRedirectToLoginForm.calledWithExactly(
              "SETTINGS",
              "AGENT",
              "ENDPOINT_RESPONSE"
            )
          );
          assert.ok(
            authenticator.submitLoginForm.calledWithExactly(
              "SETTINGS",
              "AGENT",
              "RESPONSE_WITH_LOGIN_FORM"
            )
          );
          assert.ok(
            authenticator.checkResponseFromLoginPage.calledWithExactly(
              "RESPONSE_FROM_LOGIN_FORM"
            )
          );
          assert.ok(
            authenticator.submitRedirectFromLoginForm.calledWithExactly(
              "SETTINGS",
              "AGENT",
              "RESPONSE_FROM_LOGIN_FORM"
            )
          );
          assert.equal(
            authenticator.processDestinationSystemError.getCall(0).args[1],
            "ERROR_FROM_DESTINATION_PAGE"
          );
        });
    });
  });

  describe("processDestinationSystemError", function () {
    it("Customize error with SAP details", function (done) {
      let reject = (err) => {
        assert.equal(err.message, "MESSAGE_1\nMESSAGE_2");
        done();
      };
      authenticator.processDestinationSystemError(reject, {
        response: {
          header: {
            "content-type": "application/xml",
          },
          res: {
            text:
              '<error><message lang="en">MESSAGE_1</message><message lang="cz">MESSAGE_2</message></error>',
          },
        },
      });
    });
    it("SAP details contains invalid values", function (done) {
      let errorHttp = {
        response: {
          header: {
            "content-type": "application/xml",
          },
          res: {
            text: '{"error":"ERROR"}',
          },
        },
      };
      let reject = (err) => {
        assert.deepEqual(err, errorHttp);
        done();
      };
      authenticator.processDestinationSystemError(reject, errorHttp);
    });
    it("SAP details contains non-xml response", function (done) {
      let errorHttp = {
        response: {
          header: {
            "content-type": "application/json",
          },
        },
      };
      let reject = (err) => {
        assert.deepEqual(err, errorHttp);
        done();
      };
      authenticator.processDestinationSystemError(reject, errorHttp);
    });
  });

  describe("followRequests", function () {
    it("Resolve  first request", function (done) {
      let resultGenerator = sinon.stub().returns(null);
      sinon.spy(authenticator, "followRequests");
      authenticator.followRequests(
        resultGenerator,
        Promise.resolve("RESPONSE"),
        function (response) {
          assert.equal(response, "RESPONSE");
          assert.ok(authenticator.followRequests.calledOnce);
          done();
        }
      );
    });
    it("Resolve  other request", function (done) {
      let resultGenerator = sinon.stub();
      resultGenerator.returns(Promise.resolve("RESPONSE"));
      resultGenerator.onSecondCall().returns(null);
      sinon.spy(authenticator, "followRequests");
      authenticator.followRequests(
        resultGenerator,
        Promise.resolve("RESPONSE"),
        function (response) {
          assert.equal(response, "RESPONSE");
          assert.ok(authenticator.followRequests.calledTwice);
          done();
        }
      );
    });
    it("Request rejected", function (done) {
      let resultGenerator = sinon.stub();
      resultGenerator.returns(Promise.resolve("RESPONSE"));
      resultGenerator.onSecondCall().returns(Promise.reject("ERROR"));
      sinon.spy(authenticator, "followRequests");
      authenticator.followRequests(
        resultGenerator,
        Promise.resolve("RESPONSE"),
        undefined,
        function (err) {
          assert.equal(err, "ERROR");
          assert.ok(authenticator.followRequests.calledThrice);
          done();
        }
      );
    });
  });

  it("generateFormHandler", function () {
    let promise;
    let formHandler;

    authenticator.formHandlerAction = sinon.stub();
    sinon.stub(authenticator, "followRequests");
    formHandler = authenticator.generateFormHandler("formHandlerAction");
    promise = formHandler("SETTINGS", "LOCAL_AGENT", "RESPONSE");
    authenticator.followRequests.getCall(0).args[2]("RESPONSE_FROM_REDIRECTS");
    promise.then((response) => {
      assert.ok(authenticator.followRequests.called);
      assert.equal(response, "RESPONSE_FROM_REDIRECTS");
    });
  });

  it("generateFormHandler", function () {
    let promise;
    let formHandler;

    authenticator.formHandlerAction = sinon.stub();
    sinon.stub(authenticator, "followRequests");
    formHandler = authenticator.generateFormHandler("formHandlerAction");
    promise = formHandler("SETTINGS", "LOCAL_AGENT", "RESPONSE");
    authenticator.followRequests.getCall(0).args[2]("RESPONSE_FROM_REDIRECTS");
    promise.then((response) => {
      assert.ok(authenticator.followRequests.called);
      assert.equal(response, "RESPONSE_FROM_REDIRECTS");
    });
  });

  describe("submitRedirectToLoginFormAction", function () {
    it("SAML request does not exists", function () {
      assert.strictEqual(
        authenticator.submitRedirectToLoginFormAction(
          "SETTINGS",
          "LOCAL_AGENT",
          {
            body: '<input name="NAME"/>',
          }
        ),
        undefined
      );
    });
    it("SAML request returns login form", function () {
      let send = sinon.stub();
      let localAgent = {
        post: sinon.stub().returns({
          send: send,
        }),
      };
      send.returns({
        send: send,
      });
      sinon.stub(authenticator, "nextRequestUrl").returns("URL");
      assert.strictEqual(
        authenticator.submitRedirectToLoginFormAction("SETTINGS", localAgent, {
          body:
            '<form><input name="SAMLRequest" value="Value 1"/><input name="username"/></form>',
        }),
        null
      );
      assert.ok(send.calledWith("SAMLRequest=Value%201"));
      assert.ok(send.calledWith("username="));
    });
    it("SAML request redirect SAMLRequest form", function () {
      let postAction;
      let send = sinon.stub();
      let localAgent = {
        post: sinon.stub().returns({
          send: send,
        }),
      };
      send.returns({
        send: send,
      });
      sinon.stub(authenticator, "nextRequestUrl").returns("URL");
      postAction = authenticator.submitRedirectToLoginFormAction(
        "SETTINGS",
        localAgent,
        {
          body:
            '<form><input name="SAMLRequest" value="Value 1"/><input name="secret" value"secret"/></form>',
        }
      );
      assert.ok(postAction.send.calledWith("SAMLRequest=Value%201"));
      assert.ok(postAction.send.calledWith("secret="));
    });
  });

  describe("submitRedirectToLoginFormAction", function () {
    it("SAML request does not exists", function () {
      assert.strictEqual(
        authenticator.submitLoginFormAction("SETTINGS", "LOCAL_AGENT", {
          body: '<input name="NAME"/>',
        }),
        undefined
      );
    });
    it("SAML request submit login form", function () {
      let postAction;
      let send = sinon.stub();
      let localAgent = {
        post: sinon.stub().returns({
          send: send,
        }),
      };
      send.returns({
        send: send,
      });
      sinon.stub(authenticator, "nextRequestUrl").returns("URL");
      postAction = authenticator.submitLoginFormAction(
        {
          auth: {
            password: "PASS",
            username: "USER",
          },
        },
        localAgent,
        {
          body:
            '<form><input name="SAMLRequest" value="Value 1"/>' +
            '<input name="password" value""/>' +
            '<input name="username" value""/>' +
            "</form>",
        }
      );
      assert.ok(postAction.send.calledWith("SAMLRequest=Value%201"));
      assert.ok(postAction.send.calledWith("password=PASS"));
      assert.ok(postAction.send.calledWith("username=USER"));
    });
  });

  describe("submitRedirectFromLoginFormAction", function () {
    it("SAML request does not exists", function () {
      assert.strictEqual(
        authenticator.submitRedirectFromLoginFormAction(
          "SETTINGS",
          "LOCAL_AGENT",
          {
            body: '<input name="NAME"/>',
          }
        ),
        undefined
      );
    });
    it("SAML request redirect from SAMLResponse", function () {
      let postAction;
      let send = sinon.stub();
      let localAgent = {
        post: sinon.stub().returns({
          send: send,
        }),
      };
      send.returns({
        send: send,
      });
      sinon.stub(authenticator, "nextRequestUrl").returns("URL");
      postAction = authenticator.submitRedirectFromLoginFormAction(
        "SETTINGS",
        localAgent,
        {
          body:
            '<form><input name="SAMLResponse" value="Value 1"/><input name="foo"/><input name="secret" value="secret"/></form>',
        }
      );
      assert.ok(postAction.send.calledWith("SAMLResponse=Value%201"));
      assert.ok(postAction.send.calledWith("secret=secret"));
      assert.ok(postAction.send.calledWith("foo="));
    });
  });

  describe("checkResponseFromLoginPage", function () {
    it("Valid credentials does not return SAML request", function () {
      assert.strictEqual(
        authenticator.checkResponseFromLoginPage({
          body: '<input name="NAME"/>',
        }),
        true
      );
    });
    it("Invalid credentials returns SAML request again", function () {
      assert.strictEqual(
        authenticator.checkResponseFromLoginPage({
          body: '<input name="SAMLRequest"/>',
        }),
        false
      );
    });
  });
});
