"use strict";

const assert = require("assert");
const sinon = require("sinon");
const BoundableResource = require("../../../lib/engine/BoundableResource");

describe("engine/BoundableResource", function () {
  let innerAgent;
  let metadataForBoundableObject;
  let boundableResource;

  beforeEach(function () {
    innerAgent = {};
    metadataForBoundableObject = {};
    boundableResource = new BoundableResource(
      innerAgent,
      metadataForBoundableObject
    );
  });

  it("#constructor()", function () {
    assert.strictEqual(boundableResource.meta, metadataForBoundableObject);
  });

  describe(".normalizeResponse", function () {
    let rawResponse;

    beforeEach(function () {
      rawResponse = {
        json: sinon.stub(),
        headers: {
          get: sinon.stub(),
        },
      };

      innerAgent._listResultPath = "d.results";
      innerAgent._instanceResultPath = "d";
    });

    it("raw response requested", function () {
      return boundableResource
        .normalizeResponse(rawResponse, true)
        .then((normalizedResponse) => {
          assert.equal(normalizedResponse, rawResponse);
        });
    });
    it("invalid content type", function () {
      return boundableResource
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.equal(normalizedResponse, rawResponse);
        });
    });
    it("non-json content type", function () {
      rawResponse.headers.get.returns("text/plain");
      return boundableResource
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.equal(normalizedResponse, rawResponse);
        });
    });
    it("without specified content", function () {
      rawResponse.headers.get.returns("application/json");
      rawResponse.json.returns(Promise.resolve("RESULT"));
      return boundableResource
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.equal(normalizedResponse, "RESULT");
        });
    });
    it("array content", function () {
      rawResponse.headers.get.returns("application/json");
      rawResponse.json.returns(
        Promise.resolve({
          d: {
            results: [],
          },
        })
      );
      return boundableResource
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.deepEqual(normalizedResponse, []);
        });
    });
    it("object content", function () {
      rawResponse.headers.get.returns("application/json");
      rawResponse.json.returns(Promise.resolve({ d: {} }));
      return boundableResource
        .normalizeResponse(rawResponse, false)
        .then((normalizedResponse) => {
          assert.deepEqual(normalizedResponse, {});
        });
    });
  });
});
