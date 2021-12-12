"use strict";

const assert = require("assert");
const sinon = require("sinon");
const _ = require("lodash");
const authenticator = require("../../../../lib/agent/authentication/none", {});

describe("lib/agent/authentification/none", function () {
  let headers;
  let response;
  let fetch;
  let agent;
  beforeEach(function () {
    headers = {
      get: sinon.stub().returns("application/xml"),
    };
    response = {
      status: 200,
      headers: headers,
    };
    fetch = sinon.stub().returns(Promise.resolve(response));
    agent = {
      fetch: fetch,
    };
  });
  it("Identification is set", function () {
    _.isString(authenticator.authenticatorName);
  });

  it("Endpoint is correctly loaded", function () {
    return authenticator("SETTINGS", agent, "ENDPOINT_URL").then(() => {
      assert.ok(fetch.calledWithExactly("ENDPOINT_URL"));
      assert.ok(headers.get.calledWithExactly("content-type"));
    });
  });

  it("Reject authentification if Endpoint returns non-xml data", function () {
    headers.get.returns("text/html");
    return authenticator("SETTINGS", agent, "ENDPOINT_URL")
      .then(() => assert.ok(false))
      .catch((err) => {
        assert.ok(fetch.calledWithExactly("ENDPOINT_URL"));
        assert.ok(err.message.match(/Invalid metadata/));
        assert.ok(err.unsupported);
      });
  });

  it("Reject authentification if rejects request", function () {
    fetch.returns(Promise.reject("ERROR"));
    return authenticator("SETTINGS", agent, "ENDPOINT_URL")
      .then(() => assert.ok(false))
      .catch((err) => {
        assert.ok(fetch.calledWithExactly("ENDPOINT_URL"));
        assert.equal(err, "ERROR");
        assert.ok(!err.unsupported);
      });
  });
});
