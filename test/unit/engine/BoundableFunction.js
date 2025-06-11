"use strict";

const assert = require("assert");
const sinon = require("sinon");
const BoundableFunction = require("../../../lib/engine/BoundableFunction", {});

describe("engine/BoundableFunction", function () {
  let boundableFunction;
  let boundableFunctionMetadata;
  let innerAgent;

  beforeEach(function () {
    innerAgent = {};
    boundableFunctionMetadata = {};

    boundableFunction = new BoundableFunction(
      innerAgent,
      boundableFunctionMetadata
    );
  });

  it(".createDirectCaller()", function () {
    const entity = {};

    sinon.stub(boundableFunction, "call");
    const directCaller = boundableFunction.createDirectCaller(entity);

    directCaller("ARGUMENTS");

    assert.ok(boundableFunction.call.calledWith(entity, "ARGUMENTS"));
  });

  it(".call()", function () {
    sinon.stub(boundableFunction, "get").returns(Promise.resolve("RESULT"));

    return boundableFunction.call("ENTITY", "PARAMETERS").then((result) => {
      assert.strictEqual(result, "RESULT");
      assert.ok(boundableFunction.get.calledWith("ENTITY", "PARAMETERS"));
    });
  });

  describe(".get()", function () {
    let entity;
    beforeEach(function () {
      entity = {
        urlQuery: sinon
          .stub()
          .withArgs({
            $format: "json",
          })
          .returns("QUERY"),
      };
      innerAgent.batchManager = {};
      innerAgent.get = sinon.stub().returns(Promise.resolve("RESULT"));
      sinon.stub(boundableFunction.defaultRequest, "header");
      sinon
        .stub(boundableFunction, "generatePath")
        .withArgs(entity, "PARAMETERS")
        .returns("GENERATED_PATH");
      sinon.stub(boundableFunction, "reset");
      sinon.stub(boundableFunction, "header");
      sinon
        .stub(boundableFunction, "normalizeResponse")
        .returns("NORMALIZED_RESULT");
      sinon
        .stub(boundableFunction, "_handleBatchCall")
        .returns(Promise.resolve("NORMALIZED_RESULT"));
    });

    it("direct call to odata service", function () {
      return boundableFunction.get(entity, "PARAMETERS").then((result) => {
        assert.strictEqual(result, "NORMALIZED_RESULT");
        assert.ok(
          innerAgent.get.calledWith(
            "GENERATED_PATH?QUERY",
            boundableFunction.defaultRequest._headers
          )
        );
        assert.ok(
          boundableFunction.defaultRequest.header.calledWith(
            "Content-type",
            "application/json"
          )
        );
        assert.ok(
          boundableFunction.defaultRequest.header.calledWith(
            "Accept",
            "application/json"
          )
        );
        assert.ok(boundableFunction.reset.called);
        assert.ok(boundableFunction.header.notCalled);
      });
    });

    it("use batch to call to odata service", function () {
      innerAgent.batchManager.defaultBatch = {
        get: sinon.stub().returns(Promise.resolve("BATCH_RESULT")),
      };
      innerAgent.batchManager.defaultChangeSet = {};

      return boundableFunction.get(entity, "PARAMETERS").then((result) => {
        assert.strictEqual(result, "NORMALIZED_RESULT");
        boundableFunction._handleBatchCall.getCall(0).args[0]();
        assert.deepEqual(
          innerAgent.batchManager.defaultBatch.get.getCall(0).args,
          [
            "GENERATED_PATH?QUERY",
            boundableFunction.defaultRequest._headers,
            undefined,
            innerAgent.batchManager.defaultChangeSet,
          ]
        );
        assert.ok(
          boundableFunction.header.calledWith("Accept", "application/json")
        );
        assert.ok(boundableFunction.reset.called);
        assert.ok(boundableFunction.defaultRequest.header.notCalled);
      });
    });
  });

  describe("generatePath()", function () {
    let entity;
    beforeEach(function () {
      entity = {
        getListResourcePath: sinon
          .stub()
          .returns("PREFIX/FOR/LIST_RESOURCE_PATH"),
        getSingleResourcePath: sinon
          .stub()
          .returns("PREFIX/FOR/SINGLE_RESOURCE_PATH"),
      };
      boundableFunctionMetadata.schema = {
        namespace: "TestNamespace",
      };
      boundableFunctionMetadata.name = "TestFunction";
    });
    it("throws error if entity is not provided", function () {
      assert.throws(() => {
        boundableFunction.generatePath();
      }, /Entity must be provided to generate path for bound function/);
    });

    it("generates path with entity key properties for list resource path", function () {
      const parameters = {
        key1: "value1",
        key2: "value2",
      };

      boundableFunctionMetadata.boundType = {
        elementType: "ELEMENT_TYPE",
      };
      assert.strictEqual(
        boundableFunction.generatePath(entity, parameters),
        "/PREFIX/FOR/LIST_RESOURCE_PATH/TestNamespace.TestFunction(key1=value1, key2=value2)"
      );
    });
  });
});
