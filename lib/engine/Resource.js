"use strict";

const _ = require("lodash");
const RequestDefinition = require("./RequestDefinition");

/**
 * Base object of the OData resources
 *
 * @class Resource
 */
class Resource {
  /**
   * Creates an instance of <code>Resource</code>.
   * @param {Agent} agent instance of the Agent class @see Agent.js
   * @param {Object} defaults default parameters for the resource, based on the class
   * @memberof Resource
   */
  constructor(agent, defaults = {}) {
    var normalizedDefaults = this.checkDefaults(
      this.normalizeDefaults(defaults)
    );

    Object.defineProperty(this, "agent", {
      value: agent,
      writable: false,
    });

    Object.defineProperty(this, "_defaults", {
      value: normalizedDefaults,
      writable: false,
    });
  }

  /**
   * Gets new instance of default values.
   *
   * @returns {object} new default values instance
   *
   * @memberof Resource
   * @protected
   */
  getDefaults() {
    return _.cloneDeep(this._defaults);
  }

  /**
   * Resets current default request.
   *
   * @memberof Resource
   * @protected
   */
  reset() {
    this._requestDefinition = undefined;
  }

  /**
   * Normalize default parameters to adding mandatory properties
   *
   * @param {Object} defaults which need to be normalized
   *
   * @returns {Object} normalized default parameters
   *
   * @memberof Resource
   */
  normalizeDefaults(defaults) {
    let defaultsCopy = _.cloneDeep(defaults);
    if (defaultsCopy.hasOwnProperty("raw")) {
      defaultsCopy._isRaw = defaultsCopy.raw;
      delete defaultsCopy.raw;
    }

    return _.assign(
      {
        _headers: {},
        _isRaw: false,
        _query: {},
      },
      defaultsCopy
    );
  }

  /**
   * Check default parameters used by the Resource class
   *
   * @param {Object} defaults which need to be checked
   *
   * @returns {Object} default parameteres for chaining
   *
   * @memberof Resource
   */
  checkDefaults(defaults) {
    let errors = _.chain([
      {
        test: () => {
          return !_.isPlainObject(_.get(defaults, "_query"));
        },
        message: "The default parameter query is not plain object.",
      },
      {
        test: () => {
          return !_.isPlainObject(_.get(defaults, "_headers"));
        },
        message: "The default parameter headers is not plain object.",
      },
      {
        test: () => {
          return !_.isBoolean(_.get(defaults, "_isRaw"));
        },
        message: "The default raw parameter is not Boolean.",
      },
    ])
      .filter((check) => check.test())
      .map((check) => check.message)
      .value();

    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }

    return defaults;
  }

  // see RequestDefinition.parameter
  parameter(parameterName, parameterValue) {
    this.defaultRequest.parameter(parameterName, parameterValue);
    return this;
  }

  // see RequestDefinition.parameters
  parameters(parameters) {
    this.defaultRequest.parameters(parameters);
    return this;
  }

  /**
   * Create new request definnition object for this entity.
   *
   * @returns {RequestDefinition} request definition
   * @memberof QueryableResource
   */
  request() {
    return new RequestDefinition(this, this.getDefaults());
  }

  /**
   * Set additional header for the OData request to the resource
   *
   * @param {String} key name of the header
   * @param {String} value value of the header
   *
   * @return {Resource} itself for the chaining
   *
   * @memberof Resource
   */
  header(key, value) {
    this.defaultRequest.header(key, value);
    return this;
  }

  /**
   * After the call of the method the superagent response is resolved instead
   * of the plain objects
   *
   * @return {Resource} itself for the chaining
   *
   * @memberof Resource
   */
  raw() {
    this.defaultRequest.raw();
    return this;
  }

  /**
   * Get query parameter from the entity set query structure.
   *
   * @param {String} name name of the parameter
   *
   * @return {String} current value of the query parameter
   *
   * @memberof Resource
   */
  getQueryParameter(name) {
    return this.defaultRequest.getQueryParameter(name);
  }

  /**
   * Set query parameter to the get entity set list request
   * You can use the function instead of the specific methods
   * like search or top, but you have to follow the OData protocol.
   * @see https://www.odata.org/getting-started/basic-tutorial/
   * Particular function like top or search contains additionals
   * value checks, but queryParameter just pass value to the
   *
   * @param {String} name name of the parameter
   * @param {Any} [value] parameter value is optional, if it is
   *
   * @return {Resource} itself for the chaining
   *
   * @memberof Resource
   */
  setQueryParameter(name, value) {
    this.defaultRequest.setQueryParameter(name, value);
    return this;
  }

  /**
   * Set query parameter to the get entity set list request.
   *
   * @alias setQueryParameter
   *
   * @param {String} name name of the parameter
   * @param {Any} [value] parameter value is optional, if it is
   *
   * @return {Resource} itself for the chaining
   *
   * @memberof Resource
   */
  queryParameter() {
    return this.setQueryParameter.apply(this, arguments);
  }

  /**
   * Convert query defined by queryParameter method to query part of URL
   *
   * @param {Object} defaultQueryParameters the default parameters which is replaced by this.defaultRequest.query
   *
   * @return {String} query part of the url based on the this.defaultRequest.query and defaultQueryParameters
   *
   * @memberof Resource
   */
  urlQuery(defaultQueryParameters = {}) {
    return _.chain(
      _.assign({}, defaultQueryParameters, this.defaultRequest._query)
    )
      .map((value, key) => {
        return `${key}=${value}`;
      })
      .sortBy()
      .join("&")
      .value();
  }

  /**
   * Gets (persistent) OData request definition for this entity set.
   *
   * @readonly
   * @private
   *
   * @returns {RequestDefinition} Request definition for this entity set
   *
   * @memberof Resource
   */
  get defaultRequest() {
    if (!this._requestDefinition) {
      this._requestDefinition = this.request();
    }

    return this._requestDefinition;
  }

  /**
   * Wraps batch requeswt createion
   *
   * @param {function} call main call to batch
   * @param {Batch} batchObject destination fo the request defined by call patameter
   * @returns {Promise} promise which resolved when request is received from backend
   *
   * @private
   * @memberof QueryableResource
   */
  _handleBatchCall(call, batchObject) {
    let promise;

    if (batchObject && this.agent.batchManager.has(batchObject)) {
      promise = call().promise;
      this.reset();
    } else {
      promise = Promise.reject(
        new Error("Batch object is not registered in batch manager.")
      );
    }

    return promise;
  }
}

module.exports = Resource;
