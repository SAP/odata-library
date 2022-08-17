"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const authenticator = require("../../../../lib/agent/authentication/cookie", {});
const sandbox = sinon.createSandbox();

describe("lib/agent/authentification/cookie", function () {
  afterEach(() => {
    sandbox.restore();
  });

  it("authenticate", function () {
    const agent = {
      fetch: sinon.stub().returns(Promise.resolve("RESPONSE")),
    };
    sandbox.stub(authenticator, "setCookiesToAgent").returns(Promise.resolve());
    sandbox
      .stub(authenticator, "processResponse")
      .returns(Promise.resolve("PROCESSED_RESPONSER"));

    return authenticator("SETTINGS", agent, "ENDPOINT_URL").then((response) => {
      assert.equal("PROCESSED_RESPONSER", response);
      assert.ok(
        authenticator.setCookiesToAgent.calledWithExactly(
          "SETTINGS",
          agent,
          "ENDPOINT_URL"
        )
      );
      assert.ok(authenticator.processResponse.calledWithExactly("RESPONSE"));
    });
  });

  describe("setCookiesToAgent", () => {
    let settings;
    let agent;

    beforeEach(() => {
      settings = {
        auth: {
          cookies: ["COOKIE"],
        },
      };
      agent = {
        cookieJar: {
          setCookie: sinon.stub(),
        },
      };
    });

    it("Invalid cookies in settings", () => {
      settings.auth.cookies = "";
      authenticator
        .setCookiesToAgent(settings, "AGENT", "ENDPOINT_URL")
        .catch((err) => {
          assert.ok(err.match(/Invalid/));
        });
    });

    it("set cookie to agent failes", () => {
      const promise = authenticator.setCookiesToAgent(
        settings,
        agent,
        "ENDPOINT_URL"
      );

      agent.cookieJar.setCookie.getCall(0).args[2]("ERROR");
      assert.equal(agent.cookieJar.setCookie.getCall(0).args[0], "COOKIE");
      assert.equal(
        agent.cookieJar.setCookie.getCall(0).args[1],
        "ENDPOINT_URL"
      );

      return promise.catch((err) => {
        assert.equal(err, "ERROR");
      });
    });

    it("set cookie to agent done successfully", () => {
      const promise = authenticator.setCookiesToAgent(
        settings,
        agent,
        "ENDPOINT_URL"
      );

      agent.cookieJar.setCookie.getCall(0).args[2](null, "SAVED_COOKIE");
      assert.equal(agent.cookieJar.setCookie.getCall(0).args[0], "COOKIE");
      assert.equal(
        agent.cookieJar.setCookie.getCall(0).args[1],
        "ENDPOINT_URL"
      );

      return promise.then((savedCookies) => {
        assert.deepEqual(savedCookies, ["SAVED_COOKIE"]);
      });
    });
  });

  describe("processResponse", () => {
    it("failed for error HTTP status", () => {
      assert.throws(() => {
        authenticator.processResponse({
          status: 400,
        });
      }, /Service rejects/);
    });

    it("failed for invalid content type", () => {
      assert.throws(() => {
        authenticator.processResponse({
          status: 200,
          headers: {
            get: sinon.stub().returns("application/json"),
          },
        });
      }, /Invalid metadata/);
    });

    it("Successfully checked response", () => {
      const response = {
        status: 200,
        headers: {
          get: sinon.stub().returns("application/xml"),
        },
      };
      assert.equal(authenticator.processResponse(response), response);
      assert.ok(response.headers.get.calledWithExactly("content-type"));
    });
  });
});
