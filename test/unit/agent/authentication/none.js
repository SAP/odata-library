"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const _ = require("lodash");

describe("lib/agent/authentification/none", function () {
  let authenticator;

  beforeEach(function () {
    authenticator = proxyquire("../../../../lib/agent/authentication/none", {});
  });

  it("Identification is set", function () {
    _.isString(authenticator.authenticatorName);
  });

  it("Endpoint is correctly loaded", function () {
    let response = {
      statusCode: 200,
      headers: {
        "content-type": "application/xml",
      },
    };
    let get = sinon.stub().returns(Promise.resolve(response));
    return authenticator(
      "SETTINGS",
      {
        get: get,
      },
      "ENDPOINT_URL"
    ).then(() => {
      assert.ok(get.calledWithExactly("ENDPOINT_URL"));
    });
  });

  it("Reject authentification if Endpoint returns non-xml data", function () {
    let response = {
      statusCode: 200,
      headers: {
        "content-type": "text/html",
      },
    };
    let get = sinon.stub().returns(Promise.resolve(response));
    return authenticator(
      "SETTINGS",
      {
        get: get,
      },
      "ENDPOINT_URL"
    )
      .then(() => assert.ok(false))
      .catch((err) => {
        assert.ok(get.calledWithExactly("ENDPOINT_URL"));
        assert.ok(err.message.match(/Invalid metadata/));
        assert.ok(err.unsupported);
      });
  });

  it("Reject authentification if Endpoint returns non-xml data", function () {
    let get = sinon.stub().returns(Promise.reject("ERROR"));
    return authenticator(
      "SETTINGS",
      {
        get: get,
      },
      "ENDPOINT_URL"
    )
      .then(() => assert.ok(false))
      .catch((err) => {
        assert.ok(get.calledWithExactly("ENDPOINT_URL"));
        assert.equal(err, "ERROR");
        assert.ok(!err.unsupported);
      });
  });
});
