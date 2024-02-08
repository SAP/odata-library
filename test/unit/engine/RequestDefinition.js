"use strict";

const assert = require("assert").strict;
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const _ = require("lodash");
const responseType = require("../../../lib/engine/responseType");
const requestPath = require("../../../lib/engine/request/path");

const sandbox = sinon.createSandbox();
const defaultType = {
  format: (x) => `'${x}'`,
  formatBody: (x) => x,
};

describe("RequestDefinition", function () {
  let entitySet;
  let request;
  let Filter;
  let Sorter;

  beforeEach(function () {
    Filter = sinon.stub();
    Sorter = sinon.stub();
    Filter.prototype.toURIComponent = sinon.stub();
    Sorter.prototype.toURIComponent = sinon.stub();
    let Request = proxyquire("../../../lib/engine/RequestDefinition", {
      "./entitySet/Filter": Filter,
      "./entitySet/Sorter": Sorter,
    });
    entitySet = {
      agent: {
        logger: {
          warn: sinon.stub(),
        },
      },
      count: sinon.stub(),
      createNavigationProperty: () => {},
      entityTypeModel: {
        key: [
          {
            name: "KEY1",
            type: defaultType,
          },
          {
            name: "KEY2",
            type: defaultType,
          },
        ],
        navigationProperties: [],
      },
      executeGet: sinon.stub(),
      getListResourcePath: () => "path",
      getSingleResourcePath: () => "path",
      urlQuery: (x) => x,
    };
    request = new Request(entitySet, {});
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe(".count()", function () {
    it("try run count on non-countable entity set", function () {
      request._resource.entitySetModel = {
        sap: {
          countable: false,
        },
      };
      assert.throws(() => {
        request.count();
      });
    });
    it("try run count on non-countable entity set", function () {
      request._resource.entitySetModel = {
        sap: {
          countable: true,
        },
      };
      request._resource.executeGet = sinon.stub().returns(Promise.resolve());
      sinon.stub(request, "calculatePath");
      return request.count().then(() => {
        assert.equal(request._isCount, true);
        assert.ok(request.calculatePath.called);
        assert.ok(request._resource.executeGet.calledWithExactly(request));
      });
    });
  });

  describe(".get()", function () {
    it("accepts call with no argument", function () {
      request.get();
      assert.ok(entitySet.executeGet.called);
    });
    it("accepts 1 numeric argument (top)", function () {
      sinon.stub(request, "top");
      let num = 9;
      request.get(num);
      assert.ok(request.top.calledWith(num));
    });
    it("accepts 1 object argument (key)", function () {
      sinon.stub(request, "key");
      let key = {};
      request.get(key);
      assert.ok(request.key.calledWith(key));
    });
    it("throws error for invalid arguments", function () {
      assert.throws(() => request.get("blah"));
      assert.throws(() => request.get({}, "blah"));
      assert.throws(() => request.get(1, "blah"));
    });
  });

  describe(".key()", function () {
    it("Raises error for invalid key", function () {
      sinon.stub(request, "registerAssociations");
      assert.throws(() => {
        request.key(null);
      }, /not plain object/);
      assert.throws(() => {
        request.key(10);
      }, /not plain object/);
      assert.throws(() => {
        request.key([]);
      }, /not plain object/);
    });
    it("Set valid key to parameters", function () {
      sinon.stub(request, "registerAssociations");
      request.key({
        KEY1: "VALUE1",
        KEY2: "VALUE2",
        KEY3: "VALUE3",
      });
      assert.deepEqual(request._keyValue, {
        KEY1: "VALUE1",
        KEY2: "VALUE2",
      });
      assert.ok(request.registerAssociations.calledOnce);
    });
    it("Raises error for missing value in key", function () {
      sinon.stub(request, "registerAssociations");
      assert.throws(() => {
        request.key({
          KEY2: "VALUE2",
          KEY3: "VALUE3",
        });
      });
    });
  });

  describe(".parameter()", function () {
    it("Raises error for invalid resource type", function () {
      assert.throws(() => {
        request.parameter("name", "value");
      }, /doesn't support parameters/);
    });
  });

  describe(".parameters()", function () {
    it("adds all parameters", function () {
      sinon.stub(request, "parameter");
      request.parameters({
        name1: "value1",
        name2: "value2",
      });

      assert.ok(request.parameter.calledWith("name1", "value1"));
      assert.ok(request.parameter.calledWith("name2", "value2"));
    });
  });

  describe(".registerAssociations()", function () {
    beforeEach(function () {
      sinon.stub(request, "populateActions");
      request._resource.instanceActions = "ACTIONS";
    });
    afterEach(function () {
      assert.ok(request.populateActions.calledWithExactly("ACTIONS"));
    });
    it("creates association properties", function () {
      entitySet.entityTypeModel.navigationProperties = [
        {
          name: "navProp1",
        },
      ];
      request.registerAssociations();
      assert.ok(_.has(request, "navProp1"));
      assert.ok(_.has(request, "navigationProperties.navProp1"));
    });
    it("logs shorcut collisions", function () {
      entitySet.entityTypeModel.navigationProperties = [
        {
          name: "_resource",
        },
      ];
      request.registerAssociations();
      assert.ok(_.has(request, "navigationProperties._resource"));
      assert.ok(entitySet.agent.logger.warn.called);
    });
  });

  describe(".select()", function () {
    it("throws error for missing arguments", function () {
      assert.throws(() => request.select());
    });
  });

  describe(".filter()", function () {
    it("adds encoded filter", function () {
      sinon.stub(request, "setQueryParameter");
      Filter.prototype.toURIComponent.returns("FILTER_ENCODED");
      request.filter("FILTER_DEFINITION");
      assert.ok(Filter.calledWith("FILTER_DEFINITION"));
      assert.deepEqual(request.setQueryParameter.getCall(0).args, [
        "$filter",
        "FILTER_ENCODED",
      ]);
    });
  });

  describe(".orderby()", function () {
    it("adds encoded sort", function () {
      sinon.stub(request, "setQueryParameter");
      Sorter.prototype.toURIComponent.returns("ORDERBY_CLAUSE");
      request.orderby("SORT_DEFINITION1", "SORT_DEFINITION2");
      assert.ok(
        Sorter.calledWith(entitySet.entityTypeModel, [
          "SORT_DEFINITION1",
          "SORT_DEFINITION2",
        ])
      );
      assert.deepEqual(request.setQueryParameter.getCall(0).args, [
        "$orderby",
        "ORDERBY_CLAUSE",
      ]);
    });
  });

  describe(".expand()", function () {
    it("throws error for missing arguments", function () {
      assert.throws(() => request.expand());
    });
  });

  describe(".calculatePath()", function () {
    it("exists calculation for response type", function () {
      sandbox.stub(responseType, "determine").returns(responseType.COUNT);
      sandbox
        .stub(requestPath.calculate, responseType.COUNT)
        .returns("PATH_FOR_COUNT");
      request.calculatePath();
      assert.equal(request._path, "PATH_FOR_COUNT");
      assert.ok(
        responseType.determine.calledWithExactly(request, request._resource)
      );
    });
    it("missing calculation for response type", function () {
      sandbox.stub(responseType, "determine");
      sandbox.stub(requestPath, "default").returns("PATH_DEFAULT");
      request.calculatePath();
      assert.equal(request._path, "PATH_DEFAULT");
      assert.ok(
        responseType.determine.calledWithExactly(request, request._resource)
      );
    });
  });

  describe("._isList", function () {
    it("request definition for invalid single navigation property definition", function () {
      request._resource.isMultiple = true;
      assert.strictEqual(request._isList, true);
    });
    it("request definition for single navigation property", function () {
      request._resource.isMultiple = sinon.stub().returns(false);
      assert.strictEqual(request._isList, false);
    });
    it("request definition for one entity", function () {
      request._keyValue = "KEY_VALUE";
      assert.strictEqual(request._isList, false);
    });
    it("request definition for entity create/update", function () {
      request._payload = "PAYLOAD";
      assert.strictEqual(request._isList, false);
    });
    it("request definition for entity set", function () {
      assert.strictEqual(request._isList, true);
    });
    it("request definition for entity set", function () {
      request._payload = "PAYLOAD";
      request._resource.isParameterized = true;
      assert.strictEqual(request._isList, true);
    });
  });

  describe("_isEntity", function () {
    it("request definition for invalid single navigation property definition", function () {
      request._resource.isMultiple = true;
      assert.strictEqual(request._isEntity, false);
    });
    it("request definition for single navigation property", function () {
      request._resource.isMultiple = sinon.stub().returns(false);
      assert.strictEqual(request._isEntity, true);
    });
    it("request definition for one entity", function () {
      request._keyValue = "KEY_VALUE";
      assert.strictEqual(request._isEntity, true);
    });
    it("request definition for entity create/update", function () {
      request._payload = "PAYLOAD";
      assert.strictEqual(request._isEntity, true);
    });
    it("request definition for entity set", function () {
      assert.strictEqual(request._isEntity, false);
    });
  });

  it(".payload()", function () {
    request.payload({
      key: "VALUE",
    });
    assert.deepEqual(request._payload, {
      key: "VALUE",
    });
  });

  it(".populateActions()", function () {
    request._resource.actions = "ACTIONS";
    let actions = [
      {
        createDirectCaller: sinon.stub().returns("caller"),
        meta: {
          name: "Confirm",
        },
      },
    ];
    request.populateActions(actions);
    assert.strictEqual(request.actions.Confirm, "caller");
  });

  describe(".value()", function () {
    it("property name is passed", function () {
      assert.strictEqual(request.value("PROPERTY_NAME"), request._resource);
      assert.equal(request._isValue, true);
      assert.equal(request._valuePropertyName, "PROPERTY_NAME");
    });
    it("property name is missing", function () {
      assert.strictEqual(request.value(), request._resource);
      assert.equal(request._isValue, true);
      assert.ok(!_.has(request, "_valuePropertyName"));
    });
  });
});
