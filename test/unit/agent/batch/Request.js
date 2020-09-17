"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("agent/batch/Batch", function () {
  let request;
  let Request;

  beforeEach(function () {
    Request = proxyquire("../../../../lib/agent/batch/Request", {});

    request = new Request(
      "GET",
      "/path/to/resource",
      {
        Header: "header-value",
      },
      "PAYLOAD"
    );
  });

  it(".constructor", function () {
    assert.strictEqual(request.httpMethod, "GET");
    assert.strictEqual(request.inputUrl, "/path/to/resource");
    assert.deepEqual(request.headers, {
      Header: "header-value",
    });
    assert.strictEqual(request.content, "PAYLOAD");
  });

  describe(".payload", function () {
    it("Payload for requests without body", function () {
      sinon.stub(request, "body").returns([]);
      assert.equal(
        request.payload("X-CSRF-TOKEN"),
        [
          "Content-Type: application/http",
          "x-csrf-token: X-CSRF-TOKEN",
          "Content-Transfer-Encoding: binary\n",
          "GET path/to/resource HTTP/1.1",
          "Header: header-value",
          "\n",
        ].join("\n")
      );

      request = new Request(
        "GET",
        "path/to/resource",
        {
          Header1: "header-value1",
          Header2: "header-value2",
        },
        "PAYLOAD"
      );
      sinon.stub(request, "body").returns([]);
      assert.equal(
        request.payload("X-CSRF-TOKEN"),
        [
          "Content-Type: application/http",
          "x-csrf-token: X-CSRF-TOKEN",
          "Content-Transfer-Encoding: binary\n",
          "GET path/to/resource HTTP/1.1",
          "Header1: header-value1",
          "Header2: header-value2",
          "\n",
        ].join("\n")
      );
    });

    it("Payload for requests with body", function () {
      request = new Request(
        "POST",
        "path/to/resource",
        {
          Header1: "header-value1",
          Header2: "header-value2",
        },
        "BODY"
      );
      sinon.stub(request, "body").returns(["BODY"]);
      assert.equal(
        request.payload("X-CSRF-TOKEN"),
        [
          "Content-Type: application/http",
          "Content-Transfer-Encoding: binary\n",
          "POST path/to/resource HTTP/1.1",
          "x-csrf-token: X-CSRF-TOKEN",
          "Content-Length: 4",
          "Header1: header-value1",
          "Header2: header-value2",
          "",
          "BODY",
        ].join("\n")
      );
    });
  });

  it(".body", function () {
    assert.throws(() => request.body(), /Stringifying/);
    request = new Request(
      "GET",
      "/path/to/resource",
      {
        Accept: "application/json",
      },
      "PAYLOAD"
    );
    assert.deepEqual(request.body(), ['"PAYLOAD"']);
  });

  it(".process", function () {
    let resolveResponse;
    let rawResponseCheck;
    let responseCreated;
    let Response = function (rawResponse) {
      rawResponseCheck = rawResponse;
      /* eslint-disable consistent-this */
      responseCreated = this;
      /* eslint-enable consistent-this */
      this.promise = new Promise((resolve) => {
        resolveResponse = resolve;
      });
    };
    Request = proxyquire("../../../../lib/agent/batch/Request", {
      "./Response": Response,
    });
    request = new Request(
      "GET",
      "/path/to/resource",
      {
        Header: "header-value",
      },
      "PAYLOAD"
    );
    setTimeout(() => {
      resolveResponse(responseCreated);
    }, 0);
    return request.process("RAW_RESPONSE").then((response) => {
      assert.equal(rawResponseCheck, "RAW_RESPONSE");
      assert.strictEqual(response.request, request);
    });
  });
});
