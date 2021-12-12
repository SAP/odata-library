"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const authenticator = require("../../../../lib/agent/authentication/samlSap");
const _ = require("lodash");
const { JSDOM } = require("jsdom");

describe("lib/agent/authentification/samlSap", function () {
  afterEach(function () {
    sandbox.restore();
  });

  it("Static properties and functions are created", function () {
    assert.ok(_.isString(authenticator.authenticatorName));
    assert.ok(_.isFunction(authenticator.submitRedirectToLoginForm));
    assert.ok(_.isFunction(authenticator.submitLoginForm));
    assert.ok(_.isFunction(authenticator.submitRedirectFromLoginForm));
  });

  it("Request to endpoint is correctly loaded", function () {
    let fetch = sinon.stub().returns(Promise.resolve("RESPONSE_REDIRECT"));
    sandbox.stub(authenticator, "isPossible").returns(true);
    sandbox
      .stub(authenticator, "samlHandshake")
      .returns(Promise.resolve("RESPONSE"));

    return authenticator(
      "SETTINGS",
      {
        fetch: fetch,
      },
      "ENDPOINT_URL"
    ).then((response) => {
      assert.ok(fetch.calledWithExactly("ENDPOINT_URL"));
      assert.ok(
        authenticator.samlHandshake.calledWithExactly(
          "SETTINGS",
          {
            fetch: fetch,
          },
          "RESPONSE_REDIRECT"
        )
      );
      assert.equal(response, "RESPONSE");
    });
  });

  it("Request to endpoint is correctly loaded", function () {
    let fetch = sinon.stub().returns(Promise.resolve("RESPONSE_REDIRECT"));

    sandbox.stub(authenticator, "isPossible").returns(true);
    sandbox
      .stub(authenticator, "samlHandshake")
      .returns(Promise.resolve("RESPONSE"));

    return authenticator(
      "SETTINGS",
      {
        fetch: fetch,
      },
      "ENDPOINT_URL"
    ).then((response) => {
      assert.ok(fetch.calledWithExactly("ENDPOINT_URL"));
      assert.ok(
        authenticator.samlHandshake.calledWithExactly(
          "SETTINGS",
          {
            fetch: fetch,
          },
          "RESPONSE_REDIRECT"
        )
      );
      assert.equal(response, "RESPONSE");
    });
  });

  it("Request to endpoint is not possible", function () {
    let fetch = sinon.stub().returns(Promise.resolve("RESPONSE_REDIRECT"));

    sandbox.stub(authenticator, "isPossible").returns(false);

    return authenticator(
      "SETTINGS",
      {
        fetch: fetch,
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
    let responseError = new Error();
    let fetch = sinon.stub().returns(Promise.reject(responseError));

    return authenticator(
      "SETTINGS",
      {
        fetch: fetch,
      },
      "ENDPOINT_URL"
    ).catch((error) => {
      assert.equal(error, responseError);
      assert.equal(error.unsupported, false);
    });
  });

  it("Request to endpoint is rejected as unauthorized", function () {
    let responseError = new Error();
    let fetch = sinon.stub().returns(Promise.reject(responseError));
    responseError.status = 401;

    return authenticator(
      "SETTINGS",
      {
        fetch: fetch,
      },
      "ENDPOINT_URL"
    ).catch((error) => {
      assert.equal(error, responseError);
      assert.equal(error.unsupported, true);
    });
  });

  describe("isPossible", function () {
    let headers;
    let response;
    let domDocument;
    beforeEach(function () {
      domDocument = {
        querySelector: sinon.stub().returns({}),
      };
      headers = {
        get: sinon.stub().returns("text/html"),
      };
      response = {
        status: 200,
        headers: headers,
        dom: {
          window: {
            document: domDocument,
          },
        },
      };
    });
    it("Response is correct SAMLRequest", function () {
      return authenticator
        .isPossible(response)
        .then((result) => assert.equal(result, true));
    });
    it("Response contains invalid http status code", function () {
      response.status = 404;
      return authenticator
        .isPossible(response)
        .then((result) => assert.equal(result, false));
    });
    it("Response contains invalid content type", function () {
      headers.get.returns("application/json");
      return authenticator
        .isPossible(response)
        .then((result) => assert.equal(result, false));
    });
    it("Response does not contain SAML input field", function () {
      domDocument.querySelector.returns(null);
      return authenticator
        .isPossible(response)
        .then((result) => assert.equal(result, false));
    });
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
          url: "https://localhost.localdomain/path/",
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
      sandbox
        .stub(authenticator, "submitRedirectToLoginForm")
        .returns(Promise.resolve("RESPONSE_WITH_LOGIN_FORM"));
      sandbox
        .stub(authenticator, "submitLoginForm")
        .returns(Promise.resolve("RESPONSE_FROM_LOGIN_FORM"));
      sandbox.stub(authenticator, "checkResponseFromLoginPage").returns(true);
      sandbox
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
      sandbox
        .stub(authenticator, "submitRedirectToLoginForm")
        .returns(Promise.resolve("RESPONSE_WITH_LOGIN_FORM"));
      sandbox
        .stub(authenticator, "submitLoginForm")
        .returns(Promise.resolve("RESPONSE_FROM_LOGIN_FORM"));
      sandbox.stub(authenticator, "checkResponseFromLoginPage").returns(false);
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
      sandbox
        .stub(authenticator, "submitRedirectToLoginForm")
        .returns(Promise.resolve("RESPONSE_WITH_LOGIN_FORM"));
      sandbox
        .stub(authenticator, "submitLoginForm")
        .returns(Promise.resolve("RESPONSE_FROM_LOGIN_FORM"));
      sandbox.stub(authenticator, "checkResponseFromLoginPage").returns(true);
      sandbox
        .stub(authenticator, "submitRedirectFromLoginForm")
        .returns(Promise.reject("ERROR_FROM_DESTINATION_PAGE"));
      sandbox.stub(authenticator, "processDestinationSystemError").callsArg(0);
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
            text: '<error><message lang="en">MESSAGE_1</message><message lang="cz">MESSAGE_2</message></error>',
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
    /*
     */
    let requestGenerator;
    beforeEach(function () {
      requestGenerator = sinon.stub();
      sandbox.spy(authenticator, "followRequests");
      sandbox
        .stub(authenticator, "readDom")
        .returns(Promise.resolve("RESPONSE_WITH_DOM"));
    });
    it("Resolve  first request", function (done) {
      requestGenerator.returns(null);
      authenticator.followRequests(
        requestGenerator,
        Promise.resolve("RESPONSE"),
        function (response) {
          assert.equal(response, "RESPONSE_WITH_DOM");
          assert.ok(authenticator.readDom.calledWithExactly("RESPONSE"));
          assert.ok(authenticator.followRequests.calledOnce);
          done();
        }
      );
    });
    it("Resolve  other request", function (done) {
      requestGenerator.returns(Promise.resolve("RESPONSE"));
      requestGenerator.onSecondCall().returns(null);
      authenticator.followRequests(
        requestGenerator,
        Promise.resolve("RESPONSE"),
        function (response) {
          assert.equal(response, "RESPONSE_WITH_DOM");
          assert.ok(authenticator.readDom.calledWithExactly("RESPONSE"));
          assert.ok(authenticator.followRequests.calledTwice);
          done();
        }
      );
    });
    it("Request rejected", function (done) {
      requestGenerator.returns(Promise.resolve("RESPONSE"));
      requestGenerator.onSecondCall().returns(Promise.reject("ERROR"));
      authenticator.followRequests(
        requestGenerator,
        Promise.resolve("RESPONSE"),
        undefined,
        function (err) {
          assert.equal(err, "ERROR");
          assert.ok(authenticator.followRequests.calledTwice);
          done();
        }
      );
    });
  });

  it("generateFormHandler", function () {
    let promise;
    let formHandler;

    authenticator.formHandlerAction = sinon.stub();
    sandbox.stub(authenticator, "followRequests");
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
    sandbox.stub(authenticator, "followRequests");
    formHandler = authenticator.generateFormHandler("formHandlerAction");
    promise = formHandler("SETTINGS", "LOCAL_AGENT", "RESPONSE");
    authenticator.followRequests.getCall(0).args[2]("RESPONSE_FROM_REDIRECTS");
    promise.then((response) => {
      assert.ok(authenticator.followRequests.called);
      assert.equal(response, "RESPONSE_FROM_REDIRECTS");
    });
  });

  describe("submitRedirectToLoginFormAction", function () {
    let htmlDocument;
    let response;
    let htmlSamlRequestObject;
    let getAttribute;
    let localAgent;
    beforeEach(function () {
      getAttribute = sinon.stub();
      htmlDocument = {
        querySelector: sinon.stub(),
      };
      response = {
        dom: {
          window: {
            document: htmlDocument,
          },
        },
      };
      htmlSamlRequestObject = {
        form: {
          getAttribute: getAttribute,
          elements: [
            {
              getAttribute: getAttribute,
            },
            {
              getAttribute: getAttribute,
            },
          ],
        },
      };
      localAgent = {
        fetch: sinon.stub().returns("NEXT_SAML_HOOP"),
      };
    });
    it("SAML request does not exists", function () {
      assert.strictEqual(
        authenticator.submitRedirectToLoginFormAction(
          "SETTINGS",
          "LOCAL_AGENT",
          response
        ),
        undefined
      );
    });
    it("SAML request found login form", function () {
      htmlDocument.querySelector.returns(htmlSamlRequestObject);
      getAttribute.onCall(0).returns("USERNAME");
      getAttribute.onCall(1).returns("username");
      getAttribute.onCall(2).returns("PASSWORD");
      getAttribute.onCall(3).returns("password");
      assert.strictEqual(
        authenticator.submitRedirectToLoginFormAction(
          "SETTINGS",
          localAgent,
          response
        ),
        null
      );
    });
    it("SAML request continues to next SAML hoop", function () {
      htmlDocument.querySelector.returns(htmlSamlRequestObject);
      sandbox.stub(authenticator, "nextRequestUrl").returns("URL");
      getAttribute.onCall(0).returns("PARAMETER_VALUE_1");
      getAttribute.onCall(1).returns("parameter_1");
      getAttribute.onCall(2).returns("PARAMETER_VALUE_2");
      getAttribute.onCall(3).returns("parameter_2");
      getAttribute.onCall(4).returns("FORM_ACTION");
      assert.strictEqual(
        authenticator.submitRedirectToLoginFormAction(
          "SETTINGS",
          localAgent,
          response
        ),
        "NEXT_SAML_HOOP"
      );
      assert.ok(
        authenticator.nextRequestUrl.calledWithExactly("FORM_ACTION", response)
      );
      assert.ok(localAgent.fetch.calledWith("URL"));
      assert.equal(localAgent.fetch.getCall(0).args[1].method, "POST");
      assert.equal(
        localAgent.fetch.getCall(0).args[1].body.get("parameter_1"),
        "PARAMETER_VALUE_1"
      );
      assert.equal(
        localAgent.fetch.getCall(0).args[1].body.get("parameter_2"),
        "PARAMETER_VALUE_2"
      );
    });
  });

  describe("submitLoginFormAction", function () {
    let response;
    let htmlDocument;
    beforeEach(function () {
      htmlDocument = {
        querySelector: sinon.stub(),
      };
      response = {
        dom: {
          window: {
            document: htmlDocument,
          },
        },
      };
    });
    it("SAML request does not exists", function () {
      assert.strictEqual(
        authenticator.submitLoginFormAction(
          "SETTINGS",
          "LOCAL_AGENT",
          response
        ),
        undefined
      );
    });
    it("SAML request submit login form", function () {
      let localAgent = {
        fetch: sinon.stub().returns("POST_ACTION"),
      };
      let getAttribute = sinon.stub();
      let samlRequest = {
        form: {
          getAttribute: getAttribute,
          elements: [
            {
              getAttribute: getAttribute,
            },
            {
              getAttribute: getAttribute,
            },
            {
              getAttribute: getAttribute,
            },
          ],
        },
      };
      getAttribute.onCall(0).returns("ACTION");
      getAttribute.onCall(1).returns("USERNAME");
      getAttribute.onCall(2).returns("username");
      getAttribute.onCall(3).returns("PASSWORD");
      getAttribute.onCall(4).returns("password");
      getAttribute.onCall(5).returns("SAMLValue");
      getAttribute.onCall(6).returns("SAMLRequest");
      sandbox.stub(authenticator, "nextRequestUrl").returns("URL");
      htmlDocument.querySelector.returns(samlRequest);
      assert.equal(
        authenticator.submitLoginFormAction(
          {
            auth: {
              password: "PASS",
              username: "USER",
            },
          },
          localAgent,
          response
        ),
        "POST_ACTION"
      );
      assert.ok(
        authenticator.nextRequestUrl.calledWithExactly("ACTION", response)
      );
      assert.equal(
        localAgent.fetch.getCall(0).args[1].body.get("username"),
        "USER"
      );
      assert.equal(
        localAgent.fetch.getCall(0).args[1].body.get("password"),
        "PASS"
      );
      assert.equal(
        localAgent.fetch.getCall(0).args[1].body.get("SAMLRequest"),
        "SAMLValue"
      );
      assert.equal(localAgent.fetch.getCall(0).args[0], "URL");
    });
  });

  describe("submitRedirectFromLoginFormAction", function () {
    let response;
    let htmlDocument;
    beforeEach(function () {
      htmlDocument = {
        querySelector: sinon.stub(),
      };
      response = {
        dom: {
          window: {
            document: htmlDocument,
          },
        },
      };
    });
    it("SAML request does not exists", function () {
      assert.strictEqual(
        authenticator.submitRedirectFromLoginFormAction(
          "SETTINGS",
          "LOCAL_AGENT",
          response
        ),
        undefined
      );
    });
    it("SAML request redirect got login form", function () {
      let localAgent = {
        fetch: sinon.stub().returns("POST_ACTION"),
      };
      let getAttribute = sinon.stub();
      let samlRequest = {
        form: {
          getAttribute: getAttribute,
          elements: [
            {
              getAttribute: getAttribute,
            },
          ],
        },
      };
      getAttribute.withArgs("value").returns("VALUE");
      getAttribute.withArgs("name").returns("NAME");
      getAttribute.withArgs("action").returns("ACTION");
      sandbox.stub(authenticator, "nextRequestUrl").returns("URL");
      htmlDocument.querySelector.returns(samlRequest);

      assert.equal(
        authenticator.submitRedirectFromLoginFormAction(
          "SETTINGS",
          localAgent,
          response
        ),
        "POST_ACTION"
      );
      assert.ok(
        authenticator.nextRequestUrl.calledWithExactly("ACTION", response)
      );
      assert.equal(
        localAgent.fetch.getCall(0).args[1].body.get("NAME"),
        "VALUE"
      );
      assert.equal(localAgent.fetch.getCall(0).args[0], "URL");
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

  describe("readDom", function () {
    it("returns previously parsed dom", function () {
      return authenticator
        .readDom({
          dom: "DOM",
        })
        .then((response) => {
          assert.equal(response.dom, "DOM");
        });
    });
    it("parse dom", function () {
      return authenticator
        .readDom({
          text: sinon
            .stub()
            .returns(
              Promise.resolve(
                "<!DOCTYPE html><html><head></head><body></body></html>"
              )
            ),
        })
        .then((response) => {
          assert.ok(response.dom instanceof JSDOM);
        });
    });
  });
});
