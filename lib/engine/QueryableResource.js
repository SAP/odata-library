"use strict";

const _ = require("lodash");
const Resource = require("./Resource");

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
   * @param {RequestDefinition} request optional request definition (default entity set request is used as default)
   * @return {Promise} returned promise is resolved when request is finished
   * @memberof QueryableResource
   */
  count(request = this.defaultRequest) {
    return new Promise((resolve, reject) => {
      if (!this.entitySetModel.sap.countable) {
        reject(
          new Error(
            `The EntitySet ${this.entitySetModel.name} is not countable.`
          )
        );
      } else {
        this.agent
          .get(`/${this.entitySetModel.name}/$count`, request._headers)
          .then((res) => {
            let count;

            if (request._isRaw) {
              this.reset();
              resolve(res);
            } else {
              this.reset();
              count = this.parseCount(res);
              if (isNaN(count)) {
                reject(new Error("Backend returns invalid count value."));
              }
              resolve(count);
            }
          })
          .catch((err) => {
            this.reset();
            reject(err);
          });
      }
    });
  }

  /**
   * Parse response from count with workaround for superagent which returns
   * invalid parsed body in newer versions
   *
   * @param {Response} res SuperAgent response object
   * @return {Number} returns NaN for invalid number or valid count
   * @memberof QueryableResource
   */
  parseCount(res) {
    let count = parseInt(_.get(res, "body"), 10);
    if (isNaN(count)) {
      count = parseInt(_.get(res, "res.text"), 10);
    }
    return count;
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
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    let path = `/${this.getListResourcePath()}?${this.urlQuery()}`;

    this.defaultRequest.payload(this.bodyProperties(body));
    return defaultBatch
      ? this._handleBatchCall(() => {
          this.defaultRequest.header("Accept", "application/json");
          return defaultBatch.post(
            path,
            this.defaultRequest._headers,
            this.defaultRequest._payload,
            defaultChangeSet
          );
        }, defaultBatch)
      : this._handleAgentCall(() => {
          this.header("Content-type", "application/json");
          return this.agent.post(
            path,
            this.defaultRequest._headers,
            this.defaultRequest._payload
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
    let keyProperties = this.keyProperties(body);
    let keyPredicate = this.keyPredicate(keyProperties);
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;
    let path = `/${this.entitySetModel.name}(${keyPredicate})`;

    this.defaultRequest.payload(this.bodyProperties(body));
    return defaultBatch
      ? this._handleBatchCall(() => {
          this.defaultRequest.header("Accept", "application/json");
          return defaultBatch.put(
            path,
            this.defaultRequest._headers,
            this.defaultRequest._payload,
            defaultChangeSet
          );
        }, defaultBatch)
      : this._handleAgentCall(() => {
          this.header("Content-type", "application/json");
          return this.agent.put(
            path,
            this.defaultRequest._headers,
            this.defaultRequest._payload
          );
        });
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
  merge() {
    let keyProperties;
    let keyPredicate;
    let propertiesToChange;
    let entity;
    let path;
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;

    if (arguments.length === 0 || arguments.length > 2) {
      throw new Error("Invalid body parameter for merge.");
    } else if (arguments.length === 1) {
      entity = _.assign({}, arguments[0], this.defaultRequest._keyValue);
      keyProperties = this.keyProperties(entity);
      keyPredicate = this.keyPredicate(keyProperties);
      propertiesToChange = _.pickBy(
        entity,
        (value, key) => !_.has(keyProperties, key)
      );
    } else {
      keyProperties = this.keyProperties(arguments[0]);
      keyPredicate = this.keyPredicate(keyProperties);
      // note: following assignment allows to change also properties which are part of the key
      propertiesToChange = arguments[1];
    }

    path = `/${this.entitySetModel.name}(${keyPredicate})`;
    this.defaultRequest.payload(this.bodyProperties(propertiesToChange));

    return defaultBatch
      ? this._handleBatchCall(() => {
          this.defaultRequest.header("Accept", "application/json");
          return defaultBatch.merge(
            path,
            this.defaultRequest._headers,
            this.defaultRequest._payload,
            defaultChangeSet
          );
        }, defaultBatch)
      : this._handleAgentCall(() => {
          this.header("Content-type", "application/json");
          return this.agent.merge(
            path,
            this.defaultRequest._headers,
            this.defaultRequest._payload
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
      : this._handleAgentCall(() => {
          this.header("If-Match", "*");
          return this.agent.delete(path, this.defaultRequest._headers);
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
    let defaultBatch = this.agent.batchManager.defaultBatch;
    let defaultChangeSet = this.agent.batchManager.defaultChangeSet;

    return defaultBatch
      ? this._handleBatchCall(() => {
          request.calculatePath();
          request.header("Accept", "application/json");
          return defaultBatch.get(
            request._path,
            request._headers,
            defaultChangeSet
          );
        }, defaultBatch)
      : this._handleAgentCall(
          () =>
            this.agent.get(
              request._path,
              request._headers,
              undefined,
              request._resource.entityTypeModel.hasStream
            ),
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
          entityTypeProperties,
          entityTypeModel
        )
      )
      .reduce(
        (acc, processedNavigationProperties) =>
          _.assign(acc, processedNavigationProperties),
        {}
      )
      .value();
  }

  processNavigationPropertyItems(
    navigationProperty,
    entityTypeProperties,
    entityTypeModelStart
  ) {
    let assoociationEnd = entityTypeModelStart.navigationPropertyAssociationTo(
      this.metadata.model,
      navigationProperty.name
    );
    let entityTypeModelEnd = _.get(assoociationEnd, "type");
    let navigationPropertyItems = entityTypeProperties[navigationProperty.name];
    let navigationPropertyItemsProcessed;

    if (!_.isObject(entityTypeModelEnd)) {
      throw new Error(
        `End EntityType for navigation property ${navigationProperty.name} from EntityType ${this.entityTypeModel.name} does not exists.`
      );
    }

    if (
      assoociationEnd.multiplicity === "*" &&
      _.isArray(navigationPropertyItems)
    ) {
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
      return _.assign(
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

    return new Promise((resolve, reject) => {
      this.agent
        .fetchToken()
        .then((token) => {
          this.determineRequestHeaders(request, token);
          return call();
        })
        .then((rawRes) => {
          let value = this.determineResponseResult(request, rawRes);
          this.reset();
          resolve(value);
        })
        .catch((err) => {
          this.reset();
          reject(err);
        });
    });
  }

  /**
   * Set up headers for particular request
   *
   * @param {RequestDefinition} request definition of request
   * @param {String} token for authentification OData request
   *
   * @private
   * @memberof QueryableResource
   */
  determineRequestHeaders(request, token) {
    let hasStream = request._resource.entityTypeModel.hasStream;

    if (token) {
      request.header("x-csrf-token", token);
    }
    if (!hasStream) {
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
    let value;
    let hasStream = request._resource.entityTypeModel.hasStream;

    if (request._isRaw) {
      value = response;
    } else if (hasStream) {
      value = response.body;
    } else {
      resultPath = this.agent.getResultPath(request._isList, response);
      value = this._unwrapNestedProperties(
        _.get(response, resultPath, response.ok)
      );
    }

    return value;
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

module.exports = QueryableResource;
