"use strict";

const _ = require("lodash");
const Resource = require("./Resource");

/**
 * Javascript class which implements FunctionImport funcionality
 *
 * @class FunctionImport
 * @extends {Resource}
 */
class FunctionImport extends Resource {
  /**
   * Creates an instance of <code>FunctionImport</code>.
   * @param {Agent} agent instance of the Agent class @see Agent.js
   * @param {Object} functionImportProperties information about FunctionImport from Metadata
   * @memberof FunctionImport
   */
  constructor(agent, functionImportProperties) {
    super(agent, {
      _parameters: {},
    });

    Object.defineProperty(this, "meta", {
      value: functionImportProperties,
      writable: false,
    });

    // was exposed as api, should be obsolete now
    let api = functionImportProperties.getLegacyApiObject();
    Object.defineProperty(this, "properties", {
      value: api,
      writable: false,
    });
  }

  /**
   * Create function which directly call's function import without
   * additional selection of the \"call\" method.
   *
   * @private
   *
   * @return {Function} function which directly send request to the
   *                    FunctionImport
   *
   * @memberof FunctionImport
   */
  createDirectCaller() {
    return (...args) => {
      return this.call.apply(this, args);
    };
  }

  /**
   * Call post/get method (base on the metadata) to create FunctionImport
   * request
   *
   * @public
   *
   * @param {Object} [parameters] is object which contains key/values definiton
   *        of parameter names and values (see service metadata for parameter
   *        names). The parameter is not mandatory, because parameters could be
   *        defined by queryParameter or parameter method
   *
   * @return {Promise} promise which is resolved/rejected when request is done
   *
   * @memberof FunctionImport
   */
  call(parameters) {
    this.defaultRequest.parameters(parameters);
    return this[this.httpMethod()]();
  }

  /**
   * Gets parameter definition.
   *
   * @protected
   * @param {string} parameterName name of the parameter
   * @returns {object} parameter definition, containing at least 'type'
   * @memberof FunctionImport
   */
  getParameterDefinition(parameterName) {
    return this.meta.getParameter(parameterName);
  }

  /**
   * Determine method of the class used for the HTTP request
   * for of the FunctionImport
   *
   * @private
   *
   * @returns {String} name of the method of the FunctionImport class
   *
   * @memberof FunctionImport
   */
  httpMethod() {
    const SUPPORTED_METHODS = {
      GET: "get",
      POST: "post",
    };
    return SUPPORTED_METHODS[this.meta.httpMethod] || "post";
  }

  /**
   * Send HTTP POST request to the OData server with url which define FunctionImport call
   *
   * @private
   *
   * @return {Promise} promise which is done where request is finished
   *
   * @memberof FunctionImport
   */
  post() {
    let query = this.queryFromParameters();
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    let request = this.defaultRequest;
    let path = `/${this.meta.name}?${query}`;
    let callRequestPromise;

    if (defaultBatch) {
      this.header("Accept", "application/json");
      callRequestPromise = this._handleBatchCall(() => {
        return defaultBatch.post(
          path,
          request._headers,
          undefined,
          defaultChangeSet
        );
      }, defaultBatch);
    } else {
      request.header("Content-type", "application/json");
      request.header("Accept", "application/json");
      callRequestPromise = this.agent.post(path, request._headers, undefined);
    }

    this.reset();

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
   * Send HTTP GET request to the OData server with url which define FunctionImport call
   *
   * @private
   *
   * @return {Promise} promise which is done where request is finished
   *
   * @memberof FunctionImport
   */
  get() {
    let query = this.queryFromParameters();
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    let request = this.defaultRequest;
    let path = `/${this.meta.name}?${query}`;
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
   * Normalize response and returns raw response or object or array
   *
   * @param {IncomingMessage} rawResponse from HTTP client
   * @param {Boolean} raw force to use raw response
   *
   * @returns {Object|Array} raw response object or object or results array
   *
   * @memberof FunctionImport
   */
  normalizeResponse(rawResponse, raw) {
    let promise = Promise.resolve(rawResponse);
    let contentType;

    if (!raw) {
      contentType = rawResponse.headers.get("content-type");
      if (_.isString(contentType) && contentType.match(/application\/json/)) {
        promise = rawResponse.json().then((json) => {
          let result = json;
          if (_.isArray(_.get(json, this.agent._listResultPath))) {
            result = _.get(json, this.agent._listResultPath);
          } else if (_.has(json, this.agent._instanceResultPath)) {
            result = _.get(json, this.agent._instanceResultPath);
          }
          return result;
        });
      }
    }
    return promise;
  }

  /**
   * Take FunctionImport parameters from queryParamters
   *
   * @private
   *
   * @return {[String]} array witch URL query parameters
   *
   * @memberof FunctionImport
   */
  queryFromParameters() {
    let queryParameters = _.map(this.defaultRequest._query, (value, key) => {
      return `${key}=${value}`;
    });

    let parameters = _.map(this.defaultRequest._parameters, (value, key) => {
      return `${key}=${value}`;
    });
    return _.concat(queryParameters, parameters).join("&");
  }
}

module.exports = FunctionImport;
