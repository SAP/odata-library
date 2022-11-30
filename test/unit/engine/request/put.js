"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const _ = require("lodash");
const responseType = require("../../../../lib/engine/responseType");
const requestPut = require("../../../../lib/engine/request/put");
const sandbox = sinon.createSandbox();

describe("engine/request/path", function () {
  let request;
  beforeEach(function () {
    request = {
      header: sinon.stub(),
      payload: sinon.stub(),
      calculatePath: sinon.stub(),
    };
  });
  afterEach(function () {
    sandbox.restore();
  });

  it("addHeaders", function () {
    requestPut.addHeaders(responseType.ENTITY_VALUE, request);
    assert.ok(request.header.notCalled);
    requestPut.addHeaders(responseType.LIST, request);
    assert.ok(request.header.calledWithExactly("Accept", "application/json"));
  });

  it("batchCall", function () {
    const resource = {
      defaultRequest: request,
    };
    const defaultBatch = {
      put: sinon.stub().returns("PROMISE"),
    };
    _.set(
      resource,
      "agent.batchManager.defaultChangeSet",
      "DEFAULT_CHANGE_SET"
    );
    request._payload = "PAYLOAD_CONTENT";
    request._path = "PATH";
    request._headers = "HEADERS";
    sandbox.stub(requestPut, "addHeaders");

    assert.equal(
      requestPut.batchCall(defaultBatch, responseType.LIST, resource),
      "PROMISE"
    );
    assert.ok(
      requestPut.addHeaders.calledWithExactly(responseType.LIST, request)
    );
    assert.ok(
      defaultBatch.put.calledWithExactly(
        "PATH",
        "HEADERS",
        "PAYLOAD_CONTENT",
        "DEFAULT_CHANGE_SET"
      )
    );
  });

  describe("agentCall", function () {
    let resource;
    beforeEach(function () {
      resource = {
        agent: {
          put: sinon.stub().returns("PROMISE"),
        },
      };
      request._payload = { payload: "PAYLOAD_CONTENT" };
      request._path = "PATH";
      request._headers = "HEADERS";
      sandbox.stub(requestPut, "addHeaders");
    });
    it("Send content of entity as key/value map", function () {
      assert.equal(
        requestPut.agentCall(resource, responseType.LIST, request),
        "PROMISE"
      );
      assert.ok(
        requestPut.addHeaders.calledWithExactly(responseType.LIST, request)
      );
      assert.ok(
        resource.agent.put.calledWithExactly(
          "PATH",
          "HEADERS",
          JSON.stringify({ payload: "PAYLOAD_CONTENT" })
        )
      );
    });
    it("Send content of entity as raw value", function () {
      assert.equal(
        requestPut.agentCall(resource, responseType.ENTITY_VALUE, request),
        "PROMISE"
      );
      assert.ok(
        requestPut.addHeaders.calledWithExactly(
          responseType.ENTITY_VALUE,
          request
        )
      );
      assert.ok(
        resource.agent.put.calledWithExactly("PATH", "HEADERS", {
          payload: "PAYLOAD_CONTENT",
        })
      );
    });
  });

  describe("agentCall", function () {
    let resource;
    beforeEach(function () {
      resource = {
        agent: {
          batchManager: {},
        },
        defaultRequest: request,
        _handleAgentCall: sinon.stub().returns("PROMISE"),
        _handleBatchCall: sinon.stub().returns("PROMISE"),
        bodyProperties: sinon.stub().returns("BODY_PROPERTIES"),
      };
      sandbox.stub(responseType, "determine");
    });

    it("put value to particular preperty", function () {
      responseType.determine.returns(responseType.PROPERTY_VALUE);
      assert.throws(() => {
        requestPut.call("BODY", resource);
      });
      assert.deepEqual(responseType.determine.getCall(0).args, [
        request,
        resource,
      ]);
    });

    it("raw value to direct request", function () {
      responseType.determine.returns(responseType.ENTITY_VALUE);
      sandbox.stub(requestPut, "agentCall");
      requestPut.call("BODY", resource);
      assert.deepEqual(responseType.determine.getCall(0).args, [
        request,
        resource,
      ]);
      assert.ok(request.calculatePath.calledWithExactly());
      assert.ok(request.payload.calledWithExactly("BODY"));
      resource._handleAgentCall.getCall(0).args[0]();
      assert.ok(
        requestPut.agentCall.calledWithExactly(
          resource,
          responseType.ENTITY_VALUE,
          request
        )
      );
    });

    it("formatted properties to direct request", function () {
      responseType.determine.returns(responseType.ENTITY);
      sandbox.stub(requestPut, "agentCall");
      assert.equal(requestPut.call("BODY", resource), "PROMISE");
      assert.deepEqual(responseType.determine.getCall(0).args, [
        request,
        resource,
      ]);
      assert.ok(request.calculatePath.calledWithExactly());
      assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
      resource._handleAgentCall.getCall(0).args[0]();
      assert.ok(
        requestPut.agentCall.calledWithExactly(
          resource,
          responseType.ENTITY,
          request
        )
      );
    });

    it("formatted properties to batch request", function () {
      resource.agent.batchManager.defaultBatch = "DEFAULT_BATCH";
      responseType.determine.returns(responseType.ENTITY);
      sandbox.stub(requestPut, "batchCall");
      assert.equal(requestPut.call("BODY", resource), "PROMISE");
      assert.deepEqual(responseType.determine.getCall(0).args, [
        request,
        resource,
      ]);
      assert.ok(request.calculatePath.calledWithExactly());
      assert.ok(request.payload.calledWithExactly("BODY_PROPERTIES"));
      assert.equal(
        resource._handleBatchCall.getCall(0).args[1],
        "DEFAULT_BATCH"
      );
      resource._handleBatchCall.getCall(0).args[0]();
      assert.ok(
        requestPut.batchCall.calledWithExactly(
          "DEFAULT_BATCH",
          responseType.ENTITY,
          resource
        )
      );
    });
  });
});
