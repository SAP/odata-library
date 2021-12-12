"use strict";

const log = require("../../../lib/agent/log");
const sinon = require("sinon");
const assert = require("assert").strict;

let sandbox = sinon.createSandbox();

describe("lib/engine/agent/log", function () {
  afterEach(function () {
    sandbox.restore();
  });
  describe("#formatResponseError()", function () {
    it("Process non superagent error", function () {
      assert.ok(log.formatResponseError({}) instanceof Error);
    });
    it("Process response error", function () {
      sandbox.stub(log, "parseNetweaverErrorMessage");
      assert.ok(
        log.formatResponseError({
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
      assert.ok(log.parseNetweaverErrorMessage.calledWith("ERROR"));
      log.parseNetweaverErrorMessage.restore();
    });
    it("Process response text", function () {
      sandbox.stub(log, "parseNetweaverErrorMessage").returns("PARSED_MESSAGE");
      assert.ok(
        log.formatResponseError({
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
      assert.ok(log.parseNetweaverErrorMessage.calledWith("ERROR"));
      log.parseNetweaverErrorMessage.restore();
    });
    it("Process response text", () => {
      sandbox.stub(log, "parseNetweaverErrorMessage");
      assert.ok(
        log.formatResponseError({
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
      assert.ok(log.parseNetweaverErrorMessage.calledWith(""));
      log.parseNetweaverErrorMessage.restore();
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
        log.parseNetweaverErrorMessage(responseError),
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
      assert.equal(log.parseNetweaverErrorMessage(undefined), undefined);
      assert.equal(
        log.parseNetweaverErrorMessage(responseError),
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
        log.parseNetweaverErrorMessage("<xmlerror>ERROR</xmlerror>"),
        "<xmlerror>ERROR</xmlerror>"
      );
    });
  });

  it(".logResponse", function () {
    let logger = {
      debug: sinon.stub(),
    };
    log.logResponse(
      logger,
      "COUNTER",
      "REQUEST_URL",
      {
        method: "POST",
      },
      {
        textContent: "TEXT_CONTENT",
        status: "STATUS",
        headers: "HEADERS",
        info: "INFO",
        [Symbol("foo")]: "INFO",
      }
    );
    assert.equal(
      logger.debug.getCall(0).args[0],
      'Response #COUNTER\tPOST\tREQUEST_URL\t{"status":"STATUS","headers":"HEADERS"}'
    );
  });

  it(".logRequest", function () {
    let logger = {
      debug: sinon.stub(),
    };
    log.logRequest(logger, "COUNTER", "REQUEST_URL", {
      method: "POST",
      headers: "HEADERS",
    });
    assert.equal(
      logger.debug.getCall(0).args[0],
      'Request #COUNTER\tPOST\tREQUEST_URL\t{"headers":"HEADERS"}'
    );
  });
});
