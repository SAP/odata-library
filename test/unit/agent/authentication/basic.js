"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const _ = require("lodash");
const sandbox = sinon.createSandbox();

describe("lib/agent/authentification/basic", function () {
  let authenticator;

  beforeEach(function () {
    authenticator = proxyquire(
      "../../../../lib/agent/authentication/basic",
      {}
    );
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("Identification is set", function () {
    _.isString(authenticator.authenticatorName);
  });

  it("Request to endpoint is correctly loaded", function () {
    let get = sinon.stub();
    let auth = sinon.stub();
    sandbox.stub(authenticator, "isValidResponse").returns(true);
    get.returns(Promise.resolve("VALID_RESPONSE"));
    return authenticator(
      {
        auth: {
          username: "USER",
          password: "PASSWORD",
        },
      },
      {
        get: get,
        auth: auth,
      },
      "ENDPOINT_URL"
    ).then(() => {
      assert.ok(authenticator.isValidResponse.calledWith("VALID_RESPONSE"));
      assert.ok(get.calledWithExactly("ENDPOINT_URL"));
      assert.ok(
        auth.calledWithExactly("USER", "PASSWORD", {
          type: "auto",
        })
      );
    });
  });

  it("Request endpoint fails with basic authorization ", function () {
    let get = sinon.stub();
    let auth = sinon.stub();
    get.returns(Promise.reject("ERROR"));
    return authenticator(
      {
        auth: {
          username: "USER",
          password: "PASSWORD",
        },
      },
      {
        get: get,
        auth: auth,
      },
      "ENDPOINT_URL"
    ).catch((err) => {
      assert.ok(get.calledWithExactly("ENDPOINT_URL"));
      assert.ok(
        auth.calledWithExactly("USER", "PASSWORD", {
          type: "auto",
        })
      );
      assert.equal(err, "ERROR");
      assert.ok(!err.unsupported);
    });
  });

  it("Reports unsupported Basic Auth", function () {
    let get = sinon.stub();
    let auth = sinon.stub();

    sandbox.stub(authenticator, "isValidResponse").returns(false);
    get.returns(Promise.resolve("RESPONSE"));
    return authenticator(
      {
        auth: {
          username: "USER",
          password: "PASSWORD",
        },
      },
      {
        get: get,
        auth: auth,
      },
      "ENDPOINT_URL"
    ).catch((err) => {
      assert.ok(authenticator.isValidResponse.calledWith("RESPONSE"));
      assert.equal(
        err.message,
        "OData server does not support basic authentification."
      );
      assert.ok(get.calledWithExactly("ENDPOINT_URL"));
      assert.ok(
        auth.calledWithExactly("USER", "PASSWORD", {
          type: "auto",
        })
      );
      assert.ok(err.unsupported);
    });
  });
});
