"use strict";

const _ = require("lodash");
const QueryableResource = require("./QueryableResource");
const NavigationProperty = require("./NavigationProperty");
const BoundableFunction = require("./BoundableFunction");
const BoundableAction = require("./BoundableAction");

/**
 * Envelope GET/POST/PUT/DELETE methods for particular EntitySet
 *
 * @class EntitySet
 * @extends {QueryableResource}
 */
class EntitySet extends QueryableResource {
  /**
   * Creates an instance of <code>EntitySet</code>.
   * @param {Agent} agent instance of the Agent class @see Agent.js
   * @param {Metadata} metadata instance of the metadata object that keeps service metadata
   * @param {Object} entitySetModel information about EntitySet parsed from Metadata
   * @memberof EntitySet
   */
  constructor(agent, metadata, entitySetModel) {
    let entityType = entitySetModel.entityType;
    super(agent, metadata, entitySetModel, entityType);

    Object.defineProperty(this, "actions", {
      value: [],
    });

    Object.defineProperty(this, "functions", {
      value: [],
    });

    let parameterizationInfo = entitySetModel.getParameterizationInfo(
      metadata.model.getSchema()
    );
    if (parameterizationInfo.isParameterized) {
      this.isParameterized = true;
      this.valuesAssociation = parameterizationInfo.valuesAssociation;
      this._defaults._parameters = {};
    }
  }

  /**
   * Creates a new NavigationProperty
   * @param {Metadata} metadata instance of the metadata object that keeps service metadata
   * @param {Object} navigationProperty navigation property parsed from metadata
   * @returns {Association} association instance @see NavigationProperty.js
   * @memberof EntitySet
   */
  createNavigationProperty(metadata, navigationProperty) {
    return new NavigationProperty(this, navigationProperty, metadata);
  }

  /**
   * Gets path to the list of resources
   * @returns {string} path to the list of resources
   * @memberof EntitySet
   */
  getListResourcePath() {
    return this.isParameterized
      ? this._getParametrizedListPath()
      : super.getListResourcePath();
  }

  /**
   * Gets navigation properties for current entity.
   *
   * @readonly
   * @memberof EntitySet
   */
  get navigationProperties() {
    return this.defaultRequest.navigationProperties;
  }

  /**
   * Gets parameter definition.
   *
   * @protected
   * @param {string} parameterName name of the parameter
   * @returns {object} parameter definition, containing at least 'type'
   * @memberof EntitySet
   */
  getParameterDefinition(parameterName) {
    return this.entityTypeModel.getProperty(parameterName);
  }

  /**
   * Gets path for parametrized entity set definition.
   *
   * @private
   * @returns {string} resource path
   * @memberof EntitySet
   */
  _getParametrizedListPath() {
    let predicate = _.toPairs(this.defaultRequest._parameters)
      .map((p) => `${p[0]}=${p[1]}`)
      .join(",");

    return `${this.entitySetModel.name}(${predicate})/${this.valuesAssociation.name}`;
  }

  /**
   * Add action or function to entity set/ entity instance
   *
   * @param {Action} boundableResource bound action or function
   * @param {Agent} agent - instance of the agent which handler HTTP requests
   * @memberof EntitySet
   */
  addBoundObject(boundableResource, agent) {
    if (boundableResource instanceof BoundableAction) {
      this.actions.push(boundableResource);
    } else if (boundableResource instanceof BoundableFunction) {
      this.functions.push(boundableResource);
    }

    if (boundableResource.meta.boundType.elementType === this.entityTypeModel) {
      if (!this[boundableResource.meta.name]) {
        this[boundableResource.meta.name] =
          boundableResource.createDirectCaller(this);
      } else {
        agent.logger.warn(
          `Boundable resource ${boundableResource.meta.name} is not accessible as shorthand on ${this.entitySetModel.name} entity set.`
        );
      }
    }
  }

  /**
   * Gets actions bound to entity set instance (entity type).
   *
   * @readonly
   * @memberof EntitySet
   */
  get instanceActions() {
    return this.actions.filter(
      (a) => a.meta.boundType === this.entityTypeModel
    );
  }

  /**
   * Send request to bound ODataV4 action
   *
   * @public
   * @param {engine.RequestDefinition} request odata definition
   * @return {Promise} promise resolved when call is finished
   * @memberof engine.EntitySet
   */
  callAction(request) {
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    let payload = JSON.stringify(request._payload);

    return defaultBatch
      ? this._handleBatchCall(() => {
          request.header("Accept", "application/json");
          return defaultBatch.post(
            request._path,
            request._headers,
            payload,
            defaultChangeSet
          );
        }, defaultBatch)
      : this._handleAgentCall(() =>
          this.agent.post(request._path, request._headers, payload)
        );
  }

  /**
   * Mark request definition as request for raw value ($value keyword)
   *
   * @param {String} [propertyName] name of property which is asked (if
   *        parameter is not set $value keyword will be use for whole
   *        entity}
   *
   * @return {EntitySet} itself for the chaining
   *
   * @memberof EntitySet
   */
  value(...args) {
    this.defaultRequest.value(...args);
    return this;
  }
}

module.exports = EntitySet;
