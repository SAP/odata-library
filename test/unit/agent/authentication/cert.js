"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const _ = require("lodash");
const sandbox = sinon.createSandbox();
const authenticator = require("../../../../lib/agent/authentication/cert");
const authBasic = require("../../../../lib/agent/authentication/basic");

describe("lib/agent/authentification/cert", function () {
  let agent;
  let settings;

  beforeEach(function () {
    agent = {
      fetch: sinon.stub(),
    };
    settings = {};
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("Identification is set", function () {
    assert.ok(_.isString(authenticator.authenticatorName));
  });

  it("Request to endpoint is correctly loaded", function () {
    sandbox.stub(authBasic, "isValidResponse").returns(true);
    agent.fetch.returns(Promise.resolve("VALID_RESPONSE"));
    return authenticator(settings, agent, "ENDPOINT_URL").then(() => {
      assert.ok(authBasic.isValidResponse.calledWith("VALID_RESPONSE"));
      assert.ok(agent.fetch.calledWithExactly("ENDPOINT_URL"));
    });
  });

  it("Request endpoint returns invalid response", function () {
    sandbox.stub(authBasic, "isValidResponse").returns(false);
    agent.fetch.returns(Promise.resolve("INVALID_RESPONSE"));
    return authenticator(settings, agent, "ENDPOINT_URL").catch((err) => {
      assert.ok(err instanceof Error);
      assert.ok(err.message.match(/certification/));
    });
  });

  it("Request endpoint fails with basic authorization ", function () {
    agent.fetch.returns(Promise.reject("ERROR"));
    return authenticator(settings, agent, "ENDPOINT_URL").catch((err) => {
      assert.equal(err, "ERROR");
      assert.ok(!err.unsupported);
      assert.ok(agent.fetch.calledWithExactly("ENDPOINT_URL"));
    });
  });
});
