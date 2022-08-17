"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const _ = require("lodash");
const authentication = require("../../../lib/agent/authentication");

let sandbox = sinon.createSandbox();

describe("lib/engine/agent/authentication", function () {
  afterEach(() => sandbox.restore());

  describe(".authenticate", () => {
    it("authenticate by cookie", () => {
      const agent = {
        settings: {
          auth: {
            cookies: ["COOKIE"],
          },
        },
      };
      sandbox
        .stub(authentication, "authenticateByCookie")
        .returns(Promise.resolve());
      return authentication.authenticate(agent, "ENDPOINT_URL").then(() => {
        assert.ok(
          authentication.authenticateByCookie.calledWithExactly(
            agent,
            "ENDPOINT_URL"
          )
        );
      });
    });
    it("auto authentication", () => {
      const agent = {};
      sandbox
        .stub(authentication, "authenticateAuto")
        .returns(Promise.resolve());
      return authentication.authenticate(agent, "ENDPOINT_URL").then(() => {
        assert.ok(
          authentication.authenticateAuto.calledWithExactly(
            agent,
            "ENDPOINT_URL"
          )
        );
      });
    });
  });

  describe(".authenticateAuto", function () {
    let backupAuthenticators;
    let agent;
    beforeEach(() => {
      backupAuthenticators = authentication.AUTHENTICATORS_AUTO_ORDER;
      authentication.AUTHENTICATORS_AUTO_ORDER = _.clone(backupAuthenticators);
      agent = {
        logger: {
          debug: sinon.stub(),
        },
        settings: "SETTINGS",
      };
    });
    afterEach(() => {
      authentication.AUTHENTICATORS_AUTO_ORDER = backupAuthenticators;
    });
    it("if authenticators does not exists raise error.", function () {
      authentication.AUTHENTICATORS_AUTO_ORDER = null;
      return authentication
        .authenticateAuto(agent, "URL")
        .then(() => assert.ok(false))
        .catch((err) => assert.ok(err.message.match(/not defined/)));
    });
    it("if authenticators are empty raise error.", function () {
      authentication.AUTHENTICATORS_AUTO_ORDER = [];
      return authentication
        .authenticateAuto(agent, "URL")
        .then(() => assert.ok(false))
        .catch((err) => assert.ok(err.message.match(/not defined/)));
    });
    it("Initialize authenticating by first authenticator with correct authentication", function () {
      let promise;
      sandbox.stub(authentication, "tryAuthenticator");
      authentication.AUTHENTICATORS_AUTO_ORDER = [
        sinon.stub().returns("AUTHENTICATOR"),
      ];
      promise = authentication.authenticateAuto(agent, "URL").then(() => {
        assert.ok(authentication.tryAuthenticator.calledOnce);
        assert.ok(authentication.tryAuthenticator.calledWith(1, "URL"));
        assert.deepEqual(
          authentication.AUTHENTICATORS_AUTO_ORDER[0].getCall(0).args,
          ["SETTINGS", agent, "URL"]
        );
      });

      setTimeout(() => {
        authentication.tryAuthenticator.getCall(0).args[2].success();
      }, 0);
      return promise;
    });
    it("Initialize authenticating by first authenticator but all authenticators failed", function () {
      let promise;
      sandbox.stub(authentication, "tryAuthenticator");
      authentication.AUTHENTICATORS_AUTO_ORDER = [
        sinon.stub().returns("AUTHENTICATOR"),
      ];
      promise = authentication
        .authenticateAuto(agent, "URL")
        .then(() => assert.ok(false))
        .catch(() => {
          assert.ok(authentication.tryAuthenticator.calledOnce);
          assert.ok(authentication.tryAuthenticator.calledWith(1, "URL"));
          assert.deepEqual(
            authentication.AUTHENTICATORS_AUTO_ORDER[0].getCall(0).args,
            ["SETTINGS", agent, "URL"]
          );
        });

      setTimeout(() => {
        authentication.tryAuthenticator.getCall(0).args[2].success();
      }, 0);
      return promise;
    });
  });

  describe(".tryAuthenticator", function () {
    let agent;
    beforeEach(() => {
      agent = {
        logger: {
          debug: sinon.stub(),
          warn: sinon.stub(),
        },
      };

      authentication.AUTHENTICATORS_AUTO_ORDER[0] = sinon.stub();
      authentication.AUTHENTICATORS_AUTO_ORDER[1] = sinon.stub();
      authentication.AUTHENTICATORS_AUTO_ORDER[2] = sinon.stub();
    });

    it("Succeed on first authenticator", function (done) {
      authentication.AUTHENTICATORS_AUTO_ORDER[0].authenticatorName =
        "AUTHENTICATOR";
      authentication.tryAuthenticator(1, "URL", {
        authentcatePromise: Promise.resolve("RESPONSE"),
        agent: agent,
        success: function (response) {
          assert.equal(response, "RESPONSE");
          assert.ok(
            agent.logger.debug.getCall(0).args[0].match(/AUTHENTICATOR/)
          );
          done();
        },
      });
    });
    it("Succeed on next authenticator", function (done) {
      authentication.AUTHENTICATORS_AUTO_ORDER[0].authenticatorName =
        "FIRST_AUTHENTICATOR";
      authentication.AUTHENTICATORS_AUTO_ORDER[1].returns(
        Promise.resolve("RESPONSE")
      );
      authentication.AUTHENTICATORS_AUTO_ORDER[1].authenticatorName =
        "SECOND_AUTHENTICATOR";

      authentication.tryAuthenticator(1, "URL", {
        authentcatePromise: Promise.reject({
          message: "ERROR",
          unsupported: true,
        }),
        agent: agent,
        success: function () {
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
        },
      });
    });
    it("Fails on all authenticators", function (done) {
      authentication.AUTHENTICATORS_AUTO_ORDER[1].returns(
        Promise.reject({
          message: "ERROR MESSAGE",
          unsupported: true,
        })
      );
      authentication.AUTHENTICATORS_AUTO_ORDER[2].returns(
        Promise.reject({
          message: "ERROR MESSAGE",
          unsupported: true,
        })
      );

      authentication.tryAuthenticator(1, "URL", {
        authentcatePromise: Promise.reject({
          message: "ERROR",
          unsupported: true,
        }),
        agent: agent,
        error: function (error) {
          assert.equal(
            error.message,
            "Not valid authenticator found - ERROR MESSAGE."
          );
          done();
        },
      });
    });
    it("Stops if rejection is fatal", function (done) {
      sandbox
        .stub(authentication, "fatalAuthenticateError")
        .returns("FATAL_ERROR");

      authentication.tryAuthenticator(1, "URL", {
        authentcatePromise: Promise.reject("Internet is down!"),
        agent: agent,
        error: function (error) {
          assert.equal(error, "FATAL_ERROR");
          done();
        },
      });
    });
    it("Error handler is permissive", function (done) {
      authentication.AUTHENTICATORS_AUTO_ORDER[1].returns(
        Promise.resolve("RESPONSE")
      );

      authentication.tryAuthenticator(1, "URL", {
        authentcatePromise: Promise.reject({
          response: {
            forbidden: false,
          },
        }),
        agent: agent,
        success: function (response) {
          assert.equal(response, "RESPONSE");
          done();
        },
      });
    });
  });

  describe(".fatalAuthenticateError", function () {
    it("No error for non-fatal issue", function () {
      assert.strictEqual(
        authentication.fatalAuthenticateError({
          unsupported: true,
        }),
        undefined
      );
    });
    it("No network connection.", function () {
      let err = authentication.fatalAuthenticateError(
        {},
        {
          authenticatorName: "AUTHENTICATOR_NAME",
        }
      );
      assert.ok(err instanceof Error);
      assert.ok(err.message.indexOf("AUTHENTICATOR_NAME") > -1);
    });
    it("Forbidden respons", function () {
      let err = authentication.fatalAuthenticateError(
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
      let err = authentication.fatalAuthenticateError(
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
});
