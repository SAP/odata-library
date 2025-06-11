"use strict";

const BoundableResource = require("./BoundableResource");
const urlUtils = require("../agent/url");
const _ = require("lodash");

/**
 * Javascript class which implements OData Function
 *
 * @class Function
 * @extends {Resource}
 */
class BoundableFunction extends BoundableResource {
  /**
   * Creates an instance of <code>BoundableFunction</code>.
   * @param {Agent} agent instance of the Agent class @see Agent.js
   * @param {Object} metadata information about OData Function from Metadata
   * @memberof BoundableFunction
   */

  /**
   * Create function which directly call's action without
   * additional selection of the \"call\" method.
   *
   * @private
   *
   * @param {EntitySet} [entity] is entity instance to which is the action bound, EntitySet with key properties set
   *
   * @return {Function} function which directly send request to the
   *                    Action
   *
   * @memberof BoundableFunction
   */
  createDirectCaller(entity) {
    return (parameters) => {
      return this.call.apply(this, [entity, parameters]);
    };
  }

  /**
   * Call get method to create Function request
   *
   * @public
   *
   * @param {EntitySet} [entity] is entity instance to which is the function
   *        bound EntitySet with key properties set
   * @param {Object} [parameters] is object which contains key/values definition
   *        of parameter names and values (see service metadata for parameter
   *        names). The parameter is not mandatory, because parameters could be
   *        defined by queryParameter or parameter method
   *
   * @return {Promise} promise which is resolved/rejected when request is done
   *
   * @memberof BoundableFunction
   */
  call(entity, parameters) {
    return this.get(entity, parameters);
  }

  /**
   * Create batch/direct call to the function from the odata service.
   *
   * @param {EntitySet} entity is entity instance to which is the function bound
   * @param {Object} parameters is object which contains key/values definition
   *
   *
   * @return {Promise} promise which is resolved/rejected when request is done
   * @private
   */
  get(entity, parameters) {
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    let request = this.defaultRequest;
    let path = `${this.generatePath(entity, parameters)}?${entity.urlQuery({
      $format: "json",
    })}`;
    let callRequestPromise;

    if (defaultBatch) {
      this.header("Accept", "application/json");
      callRequestPromise = this._handleBatchCall(() => {
        return defaultBatch.get(
          path,
          request._headers,
          undefined,
          defaultChangeSet
        );
      }, defaultBatch);
    } else {
      request.header("Content-type", "application/json");
      request.header("Accept", "application/json");
      callRequestPromise = this.agent.get(path, request._headers);
    }

    this.reset();

    return callRequestPromise.then((res) =>
      this.normalizeResponse(res, request._isRaw)
    );
  }

  generatePath(entity, parameters) {
    if (!entity) {
      throw new Error(
        "Entity must be provided to generate path for bound function."
      );
    }

    const qualifiedName = `${this.meta.schema.namespace}.${this.meta.name}`;
    const parametersString = _.map(
      parameters,
      (value, key) => `${key}=${encodeURIComponent(value)}`
    ).join(", ");
    const pathPrefix = this.meta.boundType.elementType
      ? entity.getListResourcePath()
      : entity.getSingleResourcePath();

    return urlUtils.absolutizePath(
      `${pathPrefix}/${qualifiedName}(${parametersString})`
    );
  }
}

module.exports = BoundableFunction;
