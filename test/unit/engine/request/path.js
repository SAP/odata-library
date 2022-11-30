"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const responseType = require("../../../../lib/engine/responseType");
const requestPath = require("../../../../lib/engine/request/path");

describe("engine/request/path", function () {
  let request;
  beforeEach(function () {
    request = {
      _valuePropertyName: "PROPERTY_NAME",
      _resource: {
        getListResourcePath: sinon.stub().returns("LIST_RESOURCE_PATH"),
        getSingleResourcePath: sinon.stub().returns("SINGLE_RESOURCE_PATH"),
        urlQuery: sinon.stub().returns("URL_QUERY"),
      },
    };
  });

  it("calculate[responseType.COUNT]", function () {
    assert.equal(
      requestPath.calculate[responseType.COUNT](request),
      "/LIST_RESOURCE_PATH/$count?URL_QUERY"
    );
  });

  it("calculate[responseType.LIST]", function () {
    assert.equal(
      requestPath.calculate[responseType.LIST](request),
      "/LIST_RESOURCE_PATH?URL_QUERY"
    );
    assert.ok(
      request._resource.urlQuery.calledWithExactly({
        $top: 100,
        $skip: 0,
        $format: "json",
      })
    );
  });

  it("calculate[responseType.ENTITY_VALUE]", function () {
    assert.equal(
      requestPath.calculate[responseType.ENTITY_VALUE](request),
      "/SINGLE_RESOURCE_PATH/$value"
    );
  });

  it("calculate[responseType.PROPERTY_VALUE]", function () {
    assert.equal(
      requestPath.calculate[responseType.PROPERTY_VALUE](request),
      "/SINGLE_RESOURCE_PATH/PROPERTY_NAME/$value"
    );
  });

  it("calculate[responseType.PROPERTY_VALUE]", function () {
    assert.equal(
      requestPath.calculate[responseType.PROPERTY_VALUE](request),
      "/SINGLE_RESOURCE_PATH/PROPERTY_NAME/$value"
    );
  });

  it("default", function () {
    assert.equal(
      requestPath.default(request),
      "/SINGLE_RESOURCE_PATH?URL_QUERY"
    );
    assert.ok(
      request._resource.urlQuery.calledWithExactly({
        $format: "json",
      })
    );
  });
});
