"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const EntitySet = require("../../../lib/engine/EntitySet");
const NavigationProperty = require("../../../lib/engine/NavigationProperty");

describe("EntitySet", function () {
  let schema;
  let entitySet;
  let innerAgent;
  let innerMetadata;
  let innerEntitySetModel;
  let innerEntityTypeModel;

  beforeEach(function () {
    schema = {};
    innerAgent = {};
    innerMetadata = {
      model: {
        getSchema: () => schema,
      },
    };
    innerEntityTypeModel = {
      getLegacyApiObject: () => {},
      navigationProperties: [],
      sap: {},
    };
    innerEntitySetModel = {
      entityType: innerEntityTypeModel,
      getParameterizationInfo: () => ({
        isParameterized: false,
      }),
      getLegacyApiObject: () => {},
      name: "entitySetName",
    };
    entitySet = new EntitySet(innerAgent, innerMetadata, innerEntitySetModel);
  });

  describe("#constructor()", function () {
    it("Properties are initialized", function () {
      entitySet = new EntitySet(innerAgent, innerMetadata, innerEntitySetModel);

      assert.deepEqual(entitySet.agent, {});
      assert.deepEqual(entitySet.entitySetModel, innerEntitySetModel);
      assert.deepEqual(entitySet.entityTypeModel, innerEntityTypeModel);
      assert.ok(entitySet.reset instanceof Function);
      assert.deepEqual(
        entitySet.defaultRequest._headers,
        entitySet._defaults._headers
      );
      assert.equal(entitySet.defaultRequest._isRaw, entitySet._defaults._isRaw);
      assert.deepEqual(
        entitySet.defaultRequest._query,
        entitySet._defaults._query
      );
      assert.ok(!entitySet.isParameterized);
    });

    it("Parametrization properties are initialized", function () {
      let navProp = {};
      let paramESM = {
        entityType: innerEntityTypeModel,
        getParameterizationInfo: () => ({
          isParameterized: true,
          valuesAssociation: navProp,
        }),
        getLegacyApiObject: () => {},
        name: "entitySetName",
      };
      entitySet = new EntitySet(innerAgent, innerMetadata, paramESM);

      assert.ok(entitySet.isParameterized);
      assert.equal(entitySet.valuesAssociation, navProp);
    });
  });

  it(".createNavigationProperty()", function () {
    entitySet = new EntitySet(innerAgent, innerMetadata, innerEntitySetModel);

    let navigationProperty = {
      relationship: "Namespace.Association",
      getTarget: sinon.stub().returns({
        entitySet: {
          entityType: {
            getLegacyApiObject: sinon.stub(),
          },
          getLegacyApiObject: sinon.stub(),
        },
      }),
    };
    let metadata = {
      model: {
        getSchema: sinon.stub(),
      },
    };

    assert.ok(
      entitySet.createNavigationProperty(
        metadata,
        navigationProperty
      ) instanceof NavigationProperty
    );
  });

  describe(".getListResourcePath()", function () {
    it("gets normal path normal entity set", function () {
      entitySet = new EntitySet(innerAgent, innerMetadata, innerEntitySetModel);

      assert.strictEqual(entitySet.getListResourcePath(), "entitySetName");
    });

    it("gets parametrized path for parametrized entity set", function () {
      entitySet.isParameterized = true;
      entitySet.valuesAssociation = {
        name: "Values",
      };
      entitySet.defaultRequest._parameters = {
        P1: "V1",
        P2: "V2",
      };

      assert.strictEqual(
        entitySet.getListResourcePath(),
        "entitySetName(P1=V1,P2=V2)/Values"
      );
    });
  });

  describe(".getParameterDefinition()", function () {
    it("gets definition from properties", function () {
      innerEntityTypeModel.getProperty = (name) => `${name}Definition`;
      entitySet = new EntitySet(innerAgent, innerMetadata, innerEntitySetModel);

      assert.strictEqual(
        entitySet.getParameterDefinition("param"),
        "paramDefinition"
      );
    });
  });

  describe(".navigationProperties", function () {
    it("expose requests navigation properties", function () {
      innerEntityTypeModel.key = [];
      entitySet = new EntitySet(innerAgent, innerMetadata, innerEntitySetModel);

      entitySet.key({});
      assert.deepEqual(entitySet.navigationProperties, {});
    });
  });

  describe(".callAction", function () {
    it("use standard request to call action", function () {
      let request = {
        _path: "PATH",
        _headers: "HEADERS",
        _payload: {
          a: 1,
        },
      };

      innerAgent.batchManager = {};
      innerAgent.post = sinon.stub();
      sinon.stub(entitySet, "_handleAgentCall");

      entitySet.callAction(request);
      entitySet._handleAgentCall.getCall(0).args[0]();

      assert.ok(innerAgent.post.calledWith("PATH", "HEADERS", '{"a":1}'));
    });
    it("use batch to call action", function () {
      let request = {
        _path: "PATH",
        _headers: "HEADERS",
        header: sinon.stub(),
      };
      let defaultBatch = {
        post: sinon.stub(),
      };

      innerAgent.batchManager = {
        defaultBatch: defaultBatch,
        defaultChangeSet: "DEFAULT_CHANGE_SET",
      };
      sinon.stub(entitySet, "_handleBatchCall");

      entitySet.callAction(request);
      entitySet._handleBatchCall.getCall(0).args[0]();

      assert.ok(
        defaultBatch.post.calledWith(
          "PATH",
          "HEADERS",
          undefined,
          "DEFAULT_CHANGE_SET"
        )
      );
      assert.ok(request.header.calledWith("Accept", "application/json"));
    });
  });
  it(".value", function () {
    sinon.stub(entitySet.defaultRequest, "value");
    assert.equal(entitySet.value("PROPERTY_NAME"), entitySet);
    assert.ok(
      entitySet.defaultRequest.value.calledWithExactly("PROPERTY_NAME")
    );
  });
});
