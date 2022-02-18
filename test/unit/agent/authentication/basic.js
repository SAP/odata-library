"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const _ = require("lodash");
const sandbox = sinon.createSandbox();
const authenticator = require("../../../../lib/agent/authentication/basic");

describe("lib/agent/authentification/basic", function () {
  let agent;
  let settings;

  beforeEach(function () {
    agent = {
      fetch: sinon.stub(),
      setAuthorizationHeaders: sinon.stub(),
    };
    settings = {
      auth: {
        username: "USER",
        password: "PASSWORD",
      },
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("Identification is set", function () {
    _.isString(authenticator.authenticatorName);
  });

  it("Request to endpoint is correctly loaded", function () {
    sandbox.stub(authenticator, "isValidResponse").returns(true);
    agent.fetch.returns(Promise.resolve("VALID_RESPONSE"));
    return authenticator(settings, agent, "ENDPOINT_URL").then(() => {
      assert.ok(authenticator.isValidResponse.calledWith("VALID_RESPONSE"));
      assert.ok(
        agent.setAuthorizationHeaders.calledWithExactly({
          Authorization: "Basic VVNFUjpQQVNTV09SRA==",
        })
      );
      assert.ok(agent.fetch.calledWith("ENDPOINT_URL"));
      assert.deepEqual(agent.fetch.getCall(0).args[1].headers, {
        Authorization: "Basic VVNFUjpQQVNTV09SRA==",
      });
    });
  });

  it("Request endpoint fails with basic authorization ", function () {
    agent.fetch.returns(Promise.reject("ERROR"));
    return authenticator(settings, agent, "ENDPOINT_URL").catch((err) => {
      assert.equal(err, "ERROR");
      assert.ok(!err.unsupported);
      assert.ok(agent.fetch.calledWith("ENDPOINT_URL"));
      assert.deepEqual(agent.fetch.getCall(0).args[1].headers, {
        Authorization: "Basic VVNFUjpQQVNTV09SRA==",
      });
    });
  });

  it("Reports unsupported Basic Auth", function () {
    agent.fetch.returns(Promise.resolve("RESPONSE"));
    sandbox.stub(authenticator, "isValidResponse").returns(false);
    return authenticator(settings, agent, "ENDPOINT_URL").catch((err) => {
      assert.ok(authenticator.isValidResponse.calledWith("RESPONSE"));
      assert.equal(
        err.message,
        "OData server does not support basic authentification."
      );
      assert.ok(err.unsupported);
      assert.ok(agent.fetch.calledWith("ENDPOINT_URL"));
      assert.deepEqual(agent.fetch.getCall(0).args[1].headers, {
        Authorization: "Basic VVNFUjpQQVNTV09SRA==",
      });
    });
  });

  describe("isValidResponse", function () {
    let response;
    beforeEach(function () {
      response = {
        status: 200,
        headers: {
          get: sinon.stub().returns("application/xml"),
        },
      };
    });
    it("response contains metadata.xml", function () {
      assert.equal(authenticator.isValidResponse(response), true);
      assert.ok(response.headers.get.calledWithExactly("content-type"));
    });
    it("password rejected", function () {
      response.status = 403;
      assert.equal(authenticator.isValidResponse(response), false);
    });
    it("invalid response", function () {
      response.headers.get.returns("text/plain");
      assert.equal(authenticator.isValidResponse(response), false);
    });
  });
});
