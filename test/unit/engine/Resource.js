"use strict";

const assert = require("assert");
const sinon = require("sinon");
const _ = require("lodash");
const proxyquire = require("proxyquire");

describe("Resource", function () {
  var Resource;
  var resource;
  var innerAgent;
  var defaults;

  beforeEach(function () {
    innerAgent = {};
    defaults = {};

    Resource = proxyquire("../../../lib/engine/Resource", {});
    resource = new Resource(innerAgent, defaults);
  });

  describe("#constructor()", function () {
    it("Properties are initialized", function () {
      assert.deepEqual(resource.agent, {});
      assert.ok(resource.reset instanceof Function);
      assert.deepEqual(resource.defaultRequest, resource._defaults);
      defaults.foo = "TEST";
      assert.ok(!_.has(resource._defaults, "foo"));

      resource = new Resource(innerAgent);
      assert.deepEqual(resource.defaultRequest, resource._defaults);

      resource = new Resource(innerAgent, {
        raw: true,
      });

      assert.ok(resource.defaultRequest._isRaw);
    });
  });

  describe(".normalizeDefaults()", function () {
    it("Create resouce mandatory properties", function () {
      assert.deepEqual(resource.normalizeDefaults({}), {
        _headers: {},
        _query: {},
        _isRaw: false,
      });
    });
    it("Not override passed mandatory properties", function () {
      assert.deepEqual(
        resource.normalizeDefaults({
          _headers: undefined,
          _query: undefined,
          _isRaw: undefined,
        }),
        {
          _headers: undefined,
          _query: undefined,
          _isRaw: undefined,
        }
      );
    });
    it("Keep additional parameters", function () {
      assert.deepEqual(
        resource.normalizeDefaults({
          foo: "BAR",
          _isRaw: true,
        }),
        {
          foo: "BAR",
          _headers: {},
          _query: {},
          _isRaw: true,
        }
      );
    });
  });

  describe(".checkDefaults()", function () {
    it("Check invalid query, header and raw default parameter", function () {
      assert.throws(
        () => {
          resource.checkDefaults({
            _headers: {},
            _query: undefined,
            _isRaw: false,
          });
        },
        function (err) {
          return err instanceof Error && !/\n/.test(err);
        }
      );
      assert.throws(
        () => {
          resource.checkDefaults({
            _headers: undefined,
            _query: {},
            _isRaw: false,
          });
        },
        function (err) {
          return err instanceof Error && !/\n/.test(err);
        }
      );
      assert.throws(
        () => {
          resource.checkDefaults({
            _headers: {},
            _query: {},
            _isRaw: 1,
          });
        },
        function (err) {
          return err instanceof Error && !/\n/.test(err);
        }
      );
    });
    it("Check more invalid properties at onse", function () {
      assert.throws(
        () => {
          resource.checkDefaults({
            _headers: undefined,
            _query: undefined,
            _isRaw: 1,
          });
        },
        function (err) {
          return err instanceof Error && err.message.split("\n").length === 3;
        }
      );
    });
  });

  describe(".raw()", function () {
    it("Enable raw response", function () {
      let request = resource.defaultRequest;
      assert.strictEqual(request._isRaw, false);
      assert.strictEqual(request.raw(), request);
      assert.strictEqual(request._isRaw, true);
      request.raw();
      assert.strictEqual(request._isRaw, true);
    });
  });

  describe(".parameters()", function () {
    it("Returns itself for chaining", function () {
      let request = resource.defaultRequest;
      sinon.stub(request, "parameters");
      const reference = resource.parameters({});
      assert.ok(reference === resource);
    });
    it("sets parameters", function () {
      let request = resource.defaultRequest;
      sinon.stub(request, "parameters");
      let params = {};
      resource.parameters(params);
      assert.ok(request.parameters.calledWith(params));
    });
  });

  describe(".header()", function () {
    it("Set additional header", function () {
      let request = resource.defaultRequest;
      assert.strictEqual(request._headers.Accept, undefined);
      resource.header("Accept", "application/json");
      assert.strictEqual(request._headers.Accept, "application/json");
    });
  });

  describe(".setQueryParameter()", function () {
    it("Returns itself for chaining", function () {
      const reference = resource.setQueryParameter("ARG1", "VAL1");
      assert.ok(reference === resource);
    });
    it("Set different types of values", function () {
      resource.setQueryParameter("$top", 100);
      assert.strictEqual(resource.getQueryParameter("$top"), 100);
      resource.setQueryParameter("search", "foo");
      assert.strictEqual(resource.getQueryParameter("search"), "foo");
      resource.setQueryParameter("foo", "bar");
      assert.strictEqual(resource.getQueryParameter("foo"), "bar");
      resource.setQueryParameter("foo", undefined);
      assert.strictEqual(resource.getQueryParameter("foo"), undefined);
    });
    it("Try to pass invalid value", function () {
      assert.throws(() => {
        resource.setQueryParameter("$top", function () {});
      });
    });
  });

  describe(".queryParameter()", function () {
    it("Returns itself for chaining", function () {
      const reference = resource.queryParameter("ARG1", "VAL1");
      assert.ok(reference === resource);
    });
    it("Pass all parameters to the setQueryParameter method", function () {
      resource.queryParameter("ARG1", "VAL1").queryParameter("ARG2", "VAL2");

      assert.strictEqual(resource.getQueryParameter("ARG1"), "VAL1");
      assert.strictEqual(resource.getQueryParameter("ARG2"), "VAL2");
    });
  });

  describe(".getQueryParameter()", function () {
    it("Try to get default parameter", function () {
      resource.setQueryParameter("$top", 100);
      assert.strictEqual(resource.getQueryParameter("$top"), 100);
    });
    it("Try to get customized existing parameter", function () {
      resource.setQueryParameter("foo", "bar");
      assert.strictEqual(resource.getQueryParameter("foo"), "bar");
    });
    it("Try to get not existing parameter", function () {
      resource.setQueryParameter("foo");
      assert.strictEqual(resource.getQueryParameter("foo"), undefined);
    });
  });

  it(".urlQuery()", function () {
    resource.defaultRequest._query = {
      PARAM1: "VALUE1",
      PARAM2: "VALUE2",
    };
    assert.equal(resource.urlQuery(), "PARAM1=VALUE1&PARAM2=VALUE2");
    assert.equal(
      resource.urlQuery({
        PARAM3: "DEFAULT_VALUE3",
      }),
      "PARAM1=VALUE1&PARAM2=VALUE2&PARAM3=DEFAULT_VALUE3"
    );
    assert.equal(
      resource.urlQuery({
        PARAM3: "DEFAULT_VALUE3",
        PARAM2: "DEFAULT_VALUE2",
      }),
      "PARAM1=VALUE1&PARAM2=VALUE2&PARAM3=DEFAULT_VALUE3"
    );
  });
});
