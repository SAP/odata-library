"use strict";

const log = require("../../../lib/agent/log");
const sinon = require("sinon");
const assert = require("assert").strict;

let sandbox = sinon.createSandbox();

describe("lib/engine/agent/log", function () {
  afterEach(function () {
    sandbox.restore();
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

  it(".logResponse defaults method to GET when method is absent", function () {
    let logger = { debug: sinon.stub() };
    log.logResponse(logger, "1", "URL", {}, { status: 200, headers: {} });
    assert.ok(logger.debug.getCall(0).args[0].includes("\tGET\t"));
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

  it(".logRequest defaults method to GET when method is absent", function () {
    let logger = { debug: sinon.stub() };
    log.logRequest(logger, "1", "URL", { headers: "HEADERS" });
    assert.ok(logger.debug.getCall(0).args[0].includes("\tGET\t"));
  });
});
