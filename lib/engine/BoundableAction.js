"use strict";

const _ = require("lodash");
const urlUtils = require("../agent/url");
const BoundableResource = require("./BoundableResource");

/**
 * Javascript class which implements Action funcionality
 *
 * @class Action
 * @extends {Resource}
 */
class Action extends BoundableResource {
  /**
   * Creates an instance of <code>Action</code>.
   * @param {Agent} agent instance of the Agent class @see Agent.js
   * @param {Object} metadata information about Action from Metadata
   * @memberof Action
   */

  /**
   * Create function which directly call's action without
   * additional selection of the \"call\" method.
   *
   * @private
   *
   * @param {EntitySet} [entity] is entity instance to which is the action bound, EntitySet with key properties set
   * @param {ActionImport} [actionImport] is action import for unbound actions
   *
   * @return {Function} function which directly send request to the
   *                    Action
   *
   * @memberof Action
   */
  createDirectCaller(entity, actionImport) {
    return (parameters) => {
      return this.call.apply(this, [entity, actionImport, parameters]);
    };
  }

  /**
   * Call post/get method (base on the metadata) to create Action request
   *
   * @public
   *
   * @param {EntitySet} [entity] is entity instance to which is the action bound, EntitySet with key properties set
   * @param {ActionImport} [actionImport] is action import for unbound actions
   * @param {Object} [parameters] is object which contains key/values definiton
   *                            of parameter names and values (see service metadata
   *                            for parameter names). The parameter is not mandatory,
   *                            because parameters could be defined by queryParameter
   *                            or parameter method
   *
   * @return {Promise} promise which is resolved/rejected when request is done
   *
   * @memberof Action
   */
  call(entity, actionImport, parameters) {
    return this[this.httpMethod()](entity, actionImport, parameters);
  }

  /**
   * Gets parameter definition.
   *
   * @protected
   * @param {string} parameterName name of the parameter
   * @returns {object} parameter definition, containing at least 'type'
   * @memberof Action
   */
  getParameterDefinition(parameterName) {
    return this.meta.parameters.find((p) => p.name === parameterName);
  }

  /**
   * Determine method of the class used for the HTTP request
   * for of the Action
   *
   * @private
   *
   * @returns {String} name of the method of the Action class
   *
   * @memberof Action
   */
  httpMethod() {
    const SUPPORTED_METHODS = {
      POST: "post",
    };
    return SUPPORTED_METHODS[this.meta.httpMethod] || "post";
  }

  /**
   * Send HTTP POST request to the OData server with url which define Action call
   *
   * @private
   *
   * @param {EntitySet} [entity] is entity instance to which is the action bound, EntitySet with key properties set
   * @param {ActionImport} [actionImport] is action import for unbound actions
   * @param {Object} [parameters] is object which contains key/values definiton
   *                            of parameter names and values (see service metadata
   *                            for parameter names). The parameter is not mandatory,
   *                            because parameters could be defined by queryParameter
   *                            or parameter method
   *
   * @return {Promise} promise which is done where request is finished
   *
   * @memberof Action
   */
  post(entity, actionImport, parameters) {
    const defaultBatch = this.agent.batchManager.defaultBatch;
    const defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    const request = this.defaultRequest;
    const path = this.getPath(entity, actionImport);
    const payload = this.getPayload(parameters, request);
    let callRequestPromise;

    if (defaultBatch) {
      this.header("Accept", "application/json");
      callRequestPromise = this._handleBatchCall(() => {
        return defaultBatch.post(
          path,
          request._headers,
          payload,
          defaultChangeSet
        );
      }, defaultBatch);
    } else {
      request.header("Content-type", "application/json");
      request.header("Accept", "application/json");
      callRequestPromise = this.agent.post(
        path,
        request._headers,
        JSON.stringify(payload)
      );
    }

    this.reset();
    if (entity) {
      entity.reset();
    }

    return new Promise((resolve, reject) => {
      callRequestPromise
        .then((res) => {
          this.normalizeResponse(res, request._isRaw).then(resolve);
        })
        .catch((err) => {
          reject(new Error(err.message));
        });
    });
  }

  /**
   * Gets action resource path
   *
   * @private
   *
   * @param {EntitySet} [entity] is entity instance (EntitySet with key properties set) to which is the action bound or undefined for unbound action
   * @param {ActionImport} [actionImport] is action import for unbound actions
   *
   * @return {string} path of the action resource
   *
   * @memberof Action
   */
  getPath(entity, actionImport) {
    const qualifiedName = `${this.meta.schema.namespace}.${this.meta.name}`;
    let path;
    if (entity) {
      const pathPrefix = this.meta.boundType.elementType
        ? entity.getListResourcePath()
        : entity.getSingleResourcePath();
      path = `${pathPrefix}/${qualifiedName}?${entity.urlQuery({
        $format: "json",
      })}`;
    } else {
      path = actionImport ? actionImport.name : this.meta.name;
    }

    return urlUtils.absolutizePath(path);
  }

  getPayload(parameters, request) {
    let payload;
    if (_.isPlainObject(parameters)) {
      request.header("Content-type", "application/json");
      const payloadObject = {};
      _.each(parameters, (value, key) => {
        const paramDefinition = this.getParameterDefinition(key);
        if (_.hasIn(paramDefinition, "type.formatBody")) {
          payloadObject[key] = paramDefinition.type.formatBody(value);
        } else if (_.hasIn(paramDefinition, "type.elementType.formatBody")) {
          payloadObject[key] = value.map((v) =>
            paramDefinition.type.elementType.formatBody(v)
          );
        }
      });
      payload = payloadObject;
    }

    return payload;
  }
}

module.exports = Action;
