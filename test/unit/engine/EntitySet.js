"use strict";

const assert = require("assert");
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
  });

  describe("#constructor()", function () {
    it("Properties are initialized", function () {
      entitySet = new EntitySet(innerAgent, innerMetadata, innerEntitySetModel);

      assert.deepEqual(entitySet.agent, {});
      assert.deepEqual(entitySet.entitySetModel, innerEntitySetModel);
      assert.deepEqual(entitySet.entityTypeModel, innerEntityTypeModel);
      assert.ok(entitySet.reset instanceof Function);
      assert.deepEqual(entitySet.defaultRequest, entitySet._defaults);
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
});
