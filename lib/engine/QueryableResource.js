"use strict";

const _ = require("lodash");
const Resource = require("./Resource");
const responseType = require("./responseType");
const parsers = require("../agent/parsers");
const requestPut = require("./request/put");
const Buffer = require("node:buffer").Buffer;

/**
 * Envelope GET/POST/PUT/DELETE methods for particular QueryableResource
 *
 * @class QueryableResource
 * @extends {Resource}
 */
class QueryableResource extends Resource {
  /**
   * Creates an instance of <code>QueryableResource</code>.
   * @param {Agent} agent instance of the Agent class @see Agent.js
   * @param {Metadata} metadata instance of the metadata object that keeps service metadata
   * @param {Object} entitySetModel information about EntitySet parsed from Metadata
   * @param {Object} entityTypeModel information about EntityType parsed from Metadata
   * @memberof QueryableResource
   */
  constructor(agent, metadata, entitySetModel, entityTypeModel) {
    super(agent, {
      _query: {},
    });

    Object.defineProperty(this, "metadata", {
      value: metadata,
    });

    Object.defineProperty(this, "entitySetModel", {
      value: entitySetModel,
    });

    Object.defineProperty(this, "entityTypeModel", {
      value: entityTypeModel,
    });
  }

  // see RequestDefinition.top
  top(top) {
    this.defaultRequest.top(top);
    return this;
  }

  // see RequestDefinition.select
  select(...args) {
    this.defaultRequest.select(...args);
    return this;
  }

  // see RequestDefinition.skip
  skip(skip) {
    this.defaultRequest.skip(skip);
    return this;
  }

  // see RequestDefinition.filter
  filter(filter) {
    this.defaultRequest.filter(filter);
    return this;
  }

  // see RequestDefinition.orderby
  orderby(...args) {
    this.defaultRequest.orderby(...args);
    return this;
  }

  // see RequestDefinition.expand
  expand(...args) {
    this.defaultRequest.expand(...args);
    return this;
  }

  // see RequestDefinition.search
  search(pattern) {
    this.defaultRequest.search(pattern);
    return this;
  }

  // see RequestDefinition.key
  key(entityKey) {
    return this.defaultRequest.key(entityKey);
  }

  /**
   * Send request to count of the EntitySet
   *
   * @param {RequestDefinition} [request] optional request definition (default entity set request is used as default)
   *
   * @return {Promise} returned promise is resolved when request is finished
   *
   * @memberof QueryableResource
   */
  count(request = this.defaultRequest) {
    return request.count();
  }

  /**
   * Sends GET request to the entity set.
   *
   * @param {*} args some arguments
   * supported argument variants
   * 1. one number argument -> list top query
   * 2. no arguments and key defined -> get entity entity
   * 3. one plain object argument -> get entity with key from this object
   * 4. no arguments and key not defined -> list query
   *
   * @return {Promise} returned promise is resolved when request is finished
   * @memberof QueryableResource
   */
  get(...args) {
    return this.defaultRequest.get(...args);
  }

  /**
   * Send request to create new entity by HTTP POST method
   *
   * @param {String} body map of the new entity which is end to the new repository
   *
   * @return {Promise} returned promise is resolved when request is finished
   * Promise is resolved with response object which contains res.body and body
   * contains newly created object.
   *
   * @memberof QueryableResource
   */
  post(body) {
    let promise;
    const defaultBatch = this.agent.batchManager.defaultBatch;
    const urlQuery = this.urlQuery();
    const path = urlQuery
      ? `/${this.getListResourcePath()}?${urlQuery}`
      : `/${this.getListResourcePath()}`;
    const error = this.checkPostParameters(body, defaultBatch);

    if (error) {
      promise = Promise.reject(error);
    } else if (this.isPlainRequest(body)) {
      promise = this.postPlainRequest(path, body);
    } else if (defaultBatch) {
      promise = this.postBatchRequest(path, body, defaultBatch);
    } else {
      promise = this.postJSONRequest(path, body);
    }

    return promise;
  }

  /**
   * Determine if the body is plain request
   *
   * @param {String} body map of the new entity which is end to the new repository
   *
   * @return {Boolean} true if the body is plain request
   */
  isPlainRequest(body) {
    return (
      body instanceof Buffer ||
      body instanceof FormData ||
      _.has(this.defaultRequest._headers, "slug")
    );
  }

  /**
   * Check input parameters for post method
   *
   * @param {String} body map of the new entity which is end to the new repository
   * @param {Batch} defaultBatch default batch for the request
   *
   * @return {Error} error if the parameters are not valid
   */
  checkPostParameters(body, defaultBatch) {
    let error;
    if (this.isPlainRequest(body)) {
      const hasStream = this.entityTypeModel.hasStream;
      if (defaultBatch) {
        error = new Error(
          "Plain or file request is not supported for batch requests."
        );
      } else if (!hasStream && this.agent.settings.strict !== false) {
        error = new Error("Buffer is not supported for this entity type.");
      }
    }
    return error;
  }

  /**
   * Send POST request without additional processing
   *
   * @param {String} path path to the entity set
   * @param {String} body Buffer/FormData (or any other data with slug header)
   *
   * @return {Promise} returned promise is resolved when request is finished
   */
  postPlainRequest(path, body) {
    this.defaultRequest.payload(body);
    this.defaultRequest._isPlain = true;
    return this._handleAgentCall((request) => {
      return this.agent.post(path, request._headers, request._payload);
    });
  }

  /**
   * Add POST request to the batch
   *
   * @param {String} path path to the entity set
   * @param {String} body map of the new entity which is end to the new repository
   * @param {Batch} defaultBatch default batch for the request
   *
   * @return {Promise} returned promise is resolved when request is finished
   */
  postBatchRequest(path, body, defaultBatch) {
    const defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    this.defaultRequest.payload(this.bodyProperties(body));
    return this._handleBatchCall(() => {
      this.defaultRequest.header("Accept", "application/json");
      return defaultBatch.post(
        path,
        this.defaultRequest._headers,
        this.defaultRequest._payload,
        defaultChangeSet
      );
    }, defaultBatch);
  }

  /**
   * Send POST request with JSON body (standard OData request)
   *
   * @param {String} path path to the entity set
   * @param {String} body map of the new entity which is send to the odata endpoint
   *
   * @return {Promise} returned promise is resolved when request is finished
   */
  postJSONRequest(path, body) {
    this.defaultRequest.payload(this.bodyProperties(body));
    return this._handleAgentCall((request) => {
      request.header("Content-Type", "application/json");
      return this.agent.post(
        path,
        request._headers,
        JSON.stringify(request._payload)
      );
    });
  }

  /**
   * Send request to update an entity by HTTP PUT method
   *
   * @param {String} body map of new data for the entity
   *
   * @return {Promise} returned promise is resolved when request is finished
   * Promise is resolved with response object which doesn't contain body
   *
   * @memberof QueryableResource
   */
  put(body) {
    return requestPut.call(body, this);
  }

  /**
   * Send request to update an entity by HTTP MERGE method (update for
   * OData protocol version 1.0-2.0)
   *
   * @param {Object} body map of key properties and new data for the entity
   * @param {Object} [propertiesToChange] map of new data for the entity
   *
   * @return {Promise} returned promise is resolved when request is finished
   * Promise is resolved with response object which doesn't contain body
   *
   * @memberof QueryableResource
   */
  merge(...args) {
    return this.processUpdateCall("merge", ...args);
  }

  /**
   * Send request to update an entity by HTTP MERGE method
   *
   * @param {Object} body map of key properties and new data for the entity
   * @param {Object} [propertiesToChange] map of new data for the entity
   *
   * @return {Promise} returned promise is resolved when request is finished
   * Promise is resolved with response object which doesn't contain body
   *
   * @memberof QueryableResource
   */
  patch(...args) {
    return this.processUpdateCall("patch", ...args);
  }

  /**
   * Send request to update entity via MERGE or PATCH method. The method
   * unify code for patch and merge methods.
   *
   * @param {String} methodName name of method from agent "merge" or "patch"
   * @param {Object} body map of key properties and new data for the entity
   * @param {Object} [propertiesToChange] map of new data for the entity
   *
   * @return {Promise} returned promise is resolved when request is finished
   * Promise is resolved with response object which doesn't contain body
   *
   * @private
   * @memberof QueryableResource
   */
  processUpdateCall(methodName, ...args) {
    let keyProperties;
    let keyPredicate;
    let propertiesToChange;
    let entity;
    let path;
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;

    if (args.length === 0 || args.length > 2) {
      throw new Error(`Invalid body parameter for ${methodName}.`);
    } else if (args.length === 1) {
      entity = _.assign({}, args[0], this.defaultRequest._keyValue);
      keyProperties = this.keyProperties(entity);
      keyPredicate = this.keyPredicate(keyProperties);
      propertiesToChange = _.pickBy(
        entity,
        (value, key) => !_.has(keyProperties, key)
      );
    } else {
      keyProperties = this.keyProperties(args[0]);
      keyPredicate = this.keyPredicate(keyProperties);
      // note: following assignment allows to change also properties which are part of the key
      propertiesToChange = args[1];
    }

    path = `/${this.entitySetModel.name}(${keyPredicate})`;
    this.defaultRequest.payload(this.bodyProperties(propertiesToChange));

    return defaultBatch
      ? this._handleBatchCall(() => {
          this.defaultRequest.header("Accept", "application/json");
          this.defaultRequest.header("If-Match", "*");
          return defaultBatch[methodName](
            path,
            this.defaultRequest._headers,
            this.defaultRequest._payload,
            defaultChangeSet
          );
        }, defaultBatch)
      : this._handleAgentCall((request) => {
          request.header("Content-Type", "application/json");
          request.header("If-Match", "*");
          return this.agent[methodName](
            path,
            request._headers,
            JSON.stringify(request._payload)
          );
        });
  }

  /**
   * Send request to delete an entity by HTTP DELETE method
   *
   * @param {String} properties map of key properties of the entity which is to be deleted
   *
   * @return {Promise} returned promise is resolved when request is finished
   * Promise is resolved with response object which doesn't contain body
   *
   * @memberof QueryableResource
   */
  delete(properties) {
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    let path;

    if (arguments.length > 0) {
      this.key(properties);
    }

    path = `/${this.getSingleResourcePath()}`;

    return defaultBatch
      ? this._handleBatchCall(() => {
          this.defaultRequest.header("If-Match", "*");
          return defaultBatch.delete(
            path,
            this.defaultRequest._headers,
            defaultChangeSet
          );
        }, defaultBatch)
      : this._handleAgentCall((request) => {
          request.header("If-Match", "*");
          return this.agent.delete(path, request._headers);
        });
  }

  /**
   * Send GET request to fetch entities requested by clauses like filter, top, count ...
   *
   * @private
   * @param {RequestDefinition} request request definition
   * @return {Promise} returned promise is resolved when request is finished
   * @memberof QueryableResource
   */
  executeGet(request) {
    const defaultBatch = this.agent.batchManager.defaultBatch;
    const defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    const foundResponseType = responseType.determine(this.defaultRequest, this);

    return defaultBatch
      ? this._handleBatchCall(() => {
          request.calculatePath();
          if (
            foundResponseType !== responseType.ENTITY_VALUE &&
            foundResponseType !== responseType.PROPERTY_VALUE
          ) {
            request.header("Accept", "application/json");
          }
          return defaultBatch.get(
            request._path,
            request._headers,
            defaultChangeSet,
            responseType.determine(request, this)
          );
        }, defaultBatch)
      : this._handleAgentCall(
          () => this.agent.get(request._path, request._headers),
          request
        );
  }

  /**
   * Filter entity object to key properties for the EntitySet
   *
   * @private
   * @param {Object} entity whole entity as Object
   *
   * @return {Object} the part of the entity with the key properties only
   *
   * @memberof QueryableResource
   */
  keyProperties(entity) {
    return this.entityTypeModel.key.reduce((acc, keyProperty) => {
      let key = keyProperty.name;
      acc[key] = keyProperty.type.format(entity[key]);
      return acc;
    }, {});
  }

  /**
   * Convert object with the entity key properties to URI component
   *
   * @protected
   * @param {Object} entityKey part of the entity with key properties
   *
   * @return {String} the part of URI which is used as key
   *
   * @memberof QueryableResource
   */
  keyPredicate(entityKey) {
    return _.chain(entityKey)
      .map((value, key) => `${key}=${value}`)
      .join(",")
      .value();
  }

  /**
   * Gets path to the single entity (with key defined)
   * @returns {string} path to the single entity
   * @memberof QueryableResource
   */
  getSingleResourcePath() {
    let keyProperties = this.keyProperties(this.defaultRequest._keyValue);
    let keyPredicate = this.keyPredicate(keyProperties);

    return `${this.getListResourcePath()}(${keyPredicate})`;
  }

  /**
   * Gets path to the list of entities
   * @returns {string} path to the list of entities
   * @memberof QueryableResource
   */
  getListResourcePath() {
    return this.entitySetModel.name;
  }

  /**
   * Convert Object with values to Object with values converted to the
   * OData primitives
   *
   * @param {Object} body map of key properties and new data for the entity
   *
   * @return {Object} Object with converted values
   *
   * @private
   * @memberof QueryableResource
   */
  bodyProperties(body) {
    return _.assign(
      this.processProperties(body, this.entityTypeModel.properties),
      this.processNavigationProperties(body, this.entityTypeModel)
    );
  }

  /**
   * Convert Object with values to Object with values converted to the
   * OData primitives
   *
   * @param {Object} entityTypeProperties map of key properties and new data for the entity
   * @param {Object} entityTypeModelProperties contains definitions of the properties from EntityType
   *        which is used to format and check body properties
   *
   * @return {Object} Object with converted values
   *
   * @private
   * @memberof QueryableResource
   */
  processProperties(entityTypeProperties, entityTypeModelProperties) {
    return entityTypeModelProperties
      .filter((entityTypeProperty) =>
        _.has(entityTypeProperties, entityTypeProperty.name)
      )
      .reduce((acc, entityTypeProperty) => {
        acc[entityTypeProperty.name] = entityTypeProperty.type.formatBody(
          entityTypeProperties[entityTypeProperty.name]
        );
        return acc;
      }, {});
  }

  /**
   * Format and check navigation properties objects
   *
   * @param {Object} entityTypeProperties is object which contains navigation properties represented
   *        by nested objects
   * @param {Object} entityTypeModel model of the entity type which is used to generate navigation properties
   *        payload
   *
   * @return {Object} Object with formatted and checked navigation properties objects
   *
   * @private
   * @memberof QueryableResource
   */
  processNavigationProperties(entityTypeProperties, entityTypeModel) {
    let navigationProperties = _.get(
      entityTypeModel,
      "navigationProperties",
      []
    );
    if (!_.isObject(entityTypeModel)) {
      throw new Error(
        "entityTypeModel is mandatory parameter for navigation property preocessing."
      );
    }

    return _.chain(navigationProperties)
      .filter((navigationProperty) =>
        _.has(entityTypeProperties, navigationProperty.name)
      )
      .map((navigationProperty) =>
        this.processNavigationPropertyItems(
          navigationProperty,
          entityTypeProperties
        )
      )
      .reduce(
        (acc, processedNavigationProperties) =>
          _.assign(acc, processedNavigationProperties),
        {}
      )
      .value();
  }

  /**
   * Go thru navigation propert items for active operations
   * (post, merge, put)
   *
   * @param {NavigationProperty} navigationProperty object which represents
   *        navigation property definition for v2 or v4
   * @param {Object} entityTypeProperties data for navigation properties
   *
   * @returns {Object} checked navigation properties items
   */
  processNavigationPropertyItems(navigationProperty, entityTypeProperties) {
    const entityTypeModelEnd = _.get(navigationProperty, "type.elementType");
    const navigationPropertyItems =
      entityTypeProperties[navigationProperty.name];
    let navigationPropertyItemsProcessed;

    if (!_.isObject(entityTypeModelEnd)) {
      throw new Error(
        `End EntityType for navigation property ${navigationProperty.name} from EntityType ${this.entityTypeModel.name} does not exists.`
      );
    }

    if (navigationProperty.isCollection && _.isArray(navigationPropertyItems)) {
      navigationPropertyItemsProcessed = _.map(
        navigationPropertyItems,
        (navigationPropertyItemsToProcess) => {
          return _.assign(
            this.processProperties(
              navigationPropertyItemsToProcess,
              _.get(entityTypeModelEnd, "properties", [])
            ),
            this.processNavigationProperties(
              navigationPropertyItemsToProcess,
              entityTypeModelEnd
            )
          );
        }
      );
    } else {
      navigationPropertyItemsProcessed = _.assign(
        this.processProperties(
          navigationPropertyItems,
          _.get(entityTypeModelEnd, "properties", [])
        ),
        this.processNavigationProperties(
          navigationPropertyItems,
          entityTypeModelEnd
        )
      );
    }

    return {
      [navigationProperty.name]: navigationPropertyItemsProcessed,
    };
  }

  /**
   * Creates a new association
   *
   * virtual method that has to be implemented in each inherited class
   * due to circular dependency
   *
   * @protected
   * @memberof QueryableResource
   */
  createNavigationProperty() {}

  /**
   * Wraps agent call (preparation, result parsing, error handling).
   *
   * @param {function} call main call to agent (async)
   * @param {RequestDefinition} requestDefinition optional request definition
   * @returns {object} value parsed from response
   *
   * @private
   * @memberof QueryableResource
   */
  _handleAgentCall(call, requestDefinition) {
    let request = requestDefinition || this.defaultRequest;

    this.reset();

    this.determineRequestHeaders(request);
    return call(request).then((rawRes) => {
      return this.determineResponseResult(request, rawRes);
    });
  }

  /**
   * Set up headers for particular request
   *
   * @param {RequestDefinition} request definition of request
   *
   * @private
   * @memberof QueryableResource
   */
  determineRequestHeaders(request) {
    if (!request._isValue && !request._isCount && !request._isPlain) {
      request.header("Accept", "application/json");
    }
  }

  /**
   * Returns value from response objects which is
   *
   * @param {RequestDefinition} request definition of request
   * @param {IncommingMessage} response object from OData server
   *
   * @return {*} Buffer (for stream) or IncommingMessage (for raw response) or Object for JSON response
   *
   * @private
   * @memberof QueryableResource
   */
  determineResponseResult(request, response) {
    let resultPath;
    let promise;
    let hasStream = request._resource.entityTypeModel.hasStream;
    let foundResponseType = responseType.determine(request, this);

    if (request._isRaw || request._isPlain) {
      promise = Promise.resolve(response);
    } else if (hasStream && foundResponseType === responseType.ENTITY_VALUE) {
      promise = response.arrayBuffer().then((bodyAsArrayBuffer) => {
        return Buffer.from(bodyAsArrayBuffer);
      });
    } else if (foundResponseType === responseType.PROPERTY_VALUE) {
      promise = response.text();
    } else if (response.status === 204) {
      promise = Promise.resolve(null);
    } else if (request._isCount === true) {
      promise = response.text().then((text) => parsers.count(text));
    } else {
      promise = response.json().then((json) => {
        resultPath = this.agent.getResultPath(request._isList, json);
        return this._unwrapNestedProperties(
          resultPath ? _.get(json, resultPath, response.ok) : json
        );
      });
    }

    return promise;
  }

  /**
   * Unwrap expanded navigation properties
   *
   *  @param {Object} response Recieved response
   *  @returns {Object} Response with unwrapped expanded navigation properties
   *
   * @private
   * @memberof QueryableResource
   */
  _unwrapNestedProperties(response) {
    let splitResponse;
    let skipResultsProperty = (value) =>
      _.has(value, "results")
        ? splitResponse(splitResponse, value.results)
        : value;
    let mapObjectProperties = (item) => _.mapValues(item, skipResultsProperty);
    let unwrapObject = (item) =>
      item && _.isObject(item) ? mapObjectProperties(item) : item;
    splitResponse = (fn, item) =>
      _.isArray(item) ? item.map(fn.bind(null, fn)) : unwrapObject(item);

    return splitResponse(splitResponse, response);
  }
}

module.exports = QueryableResource;
