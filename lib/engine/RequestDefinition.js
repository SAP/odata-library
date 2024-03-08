"use strict";

const _ = require("lodash");
const Filter = require("./entitySet/Filter");
const Sorter = require("./entitySet/Sorter");
const responseType = require("./responseType");
const requestPath = require("./request/path");

/**
 * Check validity of the key property
 *
 * @param {Object} keyDef definiton of key from metadata
 * @param {Any} entityValue value which is passed to the key
 *
 */
function checkKeyProperty(keyDef, entityValue) {
  if (!keyDef.nullable && (entityValue === undefined || entityValue === null)) {
    throw new Error(`Key property ${keyDef.name} is not defined.`);
  }
}

/**
 * Applies optional argument (top/key)
 *
 * @param {RequestDefinition} request to modify
 * @param {*} args arguments to validate and apply
 * @returns {bool} true if arguments are valid or empty
 */
function applyOptionalArgument(request, args) {
  let ok = true;
  if (args.length === 1 && _.isNumber(args[0])) {
    request.top(args[0]);
  } else if (args.length === 1 && _.isPlainObject(args[0])) {
    request.key(args[0]);
  } else {
    ok = args.length === 0;
  }

  return ok;
}

/**
 * Envelope OData request
 *
 * @class RequestDefinition
 */
class RequestDefinition {
  /**
   * Creates an instance of RequestDefinition.
   * @param {*} resource owning resource
   * @param {*} defaults initial query values
   * @memberof RequestDefinition
   */
  constructor(resource, defaults) {
    Object.defineProperty(this, "_resource", {
      value: resource,
    });

    _.merge(this, defaults);
  }

  /**
   * Send request to count of the EntitySet
   *
   * @return {Promise} returned promise is resolved when request is finished
   *
   * @memberof QueryableResource
   */
  count() {
    if (this._resource.entitySetModel.sap.countable === false) {
      throw new Error(
        `The EntitySet ${this._resource.entitySetModel.name} is not countable.`
      );
    }

    this._isCount = true;
    this.calculatePath();

    return this._resource.executeGet(this);
  }

  /**
   * Sends GET request to the entity set.
   *
   * @param {*} args some arguments
   * supported argument variants
   * 1. no arguments and key not defined -> list query
   * 2. no arguments and key defined -> get entity entity
   * 3. one plain object argument -> get entity with key from this object
   * 4. one number argument -> list top query
   *
   * @return {Promise} returned promise is resolved when request is finished
   * @memberof QueryableResource
   */
  get(...args) {
    if (!applyOptionalArgument(this, args)) {
      throw new Error(
        "Read content by the combination of parameters is not implemented."
      );
    }

    this.calculatePath();
    return this._resource.executeGet(this);
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
    return _.get(this._query, name);
  }

  /**
   * Set additional header for the OData request to the resource
   *
   * @param {String} key name of the header
   * @param {String} value value of the header
   *
   * @return {RequestDefinition} itself for the chaining
   *
   * @memberof RequestDefinition
   */
  header(key, value) {
    this._headers[key] = value;
    return this;
  }

  /**
   * Set key definiton for the entity set reading
   *
   * @param {Object} entityKey plain object with definition of the key
   *
   * @return {EntitySet} itself for the chaining
   *
   * @memberof QueryableResource
   */
  key(entityKey) {
    if (_.isPlainObject(entityKey)) {
      this._keyValue = this._resource.entityTypeModel.key.reduce(
        (acc, keyDef) => {
          checkKeyProperty(keyDef, entityKey[keyDef.name]);
          acc[keyDef.name] = entityKey[keyDef.name];
          return acc;
        },
        {}
      );
      this.registerAssociations();
    } else {
      throw new Error("Entity key is not plain object.");
    }

    return this;
  }

  /**
   * Add parameter to the current request
   *
   * @param {String} parameterName is name of the parameter
   * @param {*} parameterValue is value passed as parameter
   *
   * @returns {RequestDefinition} itself for chaining
   *
   * @memberof RequestDefinition
   */
  parameter(parameterName, parameterValue) {
    if (!this._resource.getParameterDefinition) {
      throw new Error(
        `Resource ${this._resource.name} doesn't support parameters.`
      );
    }

    let parameterDefinition =
      this._resource.getParameterDefinition(parameterName);
    this._parameters[parameterName] =
      parameterDefinition.type.format(parameterValue);
    return this;
  }

  /**
   * Add parameters to the current request
   *
   * @param {Object} [parameters] is object which contains key/values for parameters
   * @returns {RequestDefinition} itself for chaining
   * @memberof RequestDefinition
   */
  parameters(parameters) {
    if (_.isPlainObject(parameters)) {
      _.each(parameters, (value, key) => this.parameter(key, value));
    }

    return this;
  }

  /**
   * After the call of the method the superagent response is resolved instead
   * of the plain objects
   *
   * @return {RequestDefinition} itself for the chaining
   *
   * @memberof RequestDefinition
   */
  raw() {
    this._isRaw = true;
    return this;
  }

  /**
   * Creates Object with OData Associations wrappers
   * @returns {RequestDefinition} itself for the chaining
   * @memberof RequestDefinition
   */
  registerAssociations() {
    this.navigationProperties = {};
    this._resource.entityTypeModel.navigationProperties.forEach((property) => {
      let name = property.name;

      this.navigationProperties[name] = this._resource.createNavigationProperty(
        this._resource.metadata,
        property
      );
      if (!this[name]) {
        this[name] = this.navigationProperties[name];
      } else {
        this._resource.agent.logger.warn(
          `Association ${name} is not accessible as shorthand.`
        );
      }
    });

    this.populateActions(this._resource.instanceActions);

    return this;
  }

  /**
   * Search parameter is SAP enhancement for fulltext search
   * in the EntitySet values
   *
   * @param {String} pattern string which is used as pattern for the fulltext searcb
   *
   * @return {RequestDefinition} itself for the chaining
   *
   * @memberof RequestDefinition
   */
  search(pattern) {
    if (this._resource.entitySetModel.sap.searchable) {
      if (_.isString(pattern)) {
        this.setQueryParameter("search", pattern);
      } else {
        throw new Error(
          `The  pattern ${pattern} is not correct patter for search.`
        );
      }
    } else {
      throw new Error(
        `The EntitySet ${this._resource.entitySetModel.name} is not searcheable.`
      );
    }

    return this;
  }

  /**
   * Limit properties which is fetched from OData server
   *
   * @param {String|[String]} propertyName name of the property which is selected
   *        You can pass more parameterNames at once also:
   *
   * @example
   *        service.EntitySetName.select("Property_Name_1", "Property_Name_1");
   *        service.EntitySetName.select(["Property_Name_1", "Property_Name_1"]);
   *
   * @see
   *        https://www.odata.org/getting-started/basic-tutorial/#select
   *
   * @return {RequestDefinition} itself for the chaining
   *
   * @memberof RequestDefinition
   */
  select() {
    let propertyNames;
    if (arguments.length > 0) {
      propertyNames = _.reduce(
        arguments,
        (acc, property) => _.concat(acc, property),
        []
      );
      propertyNames.forEach((name) =>
        this._resource.entityTypeModel.getProperty(name)
      );
    } else {
      throw new Error("Missing parameter.");
    }

    this.setQueryParameter(
      "$select",
      propertyNames.map(encodeURIComponent).join(",")
    );

    return this;
  }

  /**
   * Sets filter for entity list query.
   *
   * @param {String} filter filter expression
   *
   * @example
   * 		service.EntitySetName.orderby("Property_1 eq 'x'");
   *
   * @returns {RequestDefinition} itself to allow method chaining
   *
   * @memberof RequestDefinition
   */
  filter(filter) {
    return this.setQueryParameter(
      "$filter",
      new Filter(filter).toURIComponent()
    );
  }

  /**
   * Sets sort order for entity list query.
   *
   * @param {String|[String]} args property sort expression(s), asc is default sort direction
   *
   * @example
   * 		service.EntitySetName.orderby("Property_1");
   * 		service.EntitySetName.orderby("Property_1", "Property_2 desc");
   *
   * @returns {RequestDefinition} itself to allow method chaining
   *
   * @memberof RequestDefinition
   */
  orderby(...args) {
    return this.setQueryParameter(
      "$orderby",
      new Sorter(this._resource.entityTypeModel, args).toURIComponent()
    );
  }

  /**
   * Specifies the related resources to be included in line with retrieved resources.
   *
   * @param {String|[String]} path path to resource to be expanded
   *        You can pass more parameterNames at once also:
   *
   * @example
   *        service.EntitySetName.expand("Property_1", "Property_2/Property_3");
   *        service.EntitySetName.expand(["Property_1", "Property_2/Property_3"]);
   *
   * @see
   *        https://www.odata.org/getting-started/basic-tutorial/#expand
   *
   * @return {RequestDefinition} itself for the chaining
   *
   * @memberof RequestDefinition
   */
  expand() {
    let paths;
    if (arguments.length > 0) {
      paths = _.reduce(
        arguments,
        (acc, property) => _.concat(acc, property),
        []
      );
      paths.forEach((expandPath) => {
        let navigationProperties = expandPath.split("/");
        navigationProperties.reduce((acc, navigationPropertyName) => {
          let navigationProperty = acc.getNavigationProperty(
            navigationPropertyName
          );
          return navigationProperty.getTarget(
            this._resource.metadata.model.getSchema(),
            this._resource.entitySetModel
          ).entityType;
        }, this._resource.entityTypeModel);
      });
    } else {
      throw new Error("Missing parameter.");
    }

    this.setQueryParameter("$expand", paths.map(encodeURIComponent).join(","));

    return this;
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
   * @return {RequestDefinition} himself for the chaining
   *
   * @memberof RequestDefinition
   */
  setQueryParameter(name, value) {
    if (value === undefined || value === null || !_.isFunction(value)) {
      this._query = _.assign(this._query, {
        [name]: value,
      });
    } else {
      throw new Error("Try to pass invalid value to query parameter.");
    }

    return this;
  }

  /**
   * Set offset which is used read the entities
   *
   * @param {Number} skip is number of entities which to be skipped
   *
   * @return {EntitySet} itself for the chaining
   *
   * @memberof QueryableResource
   */
  skip(skip) {
    let skipNormalized;

    if (this._resource.entitySetModel.sap.pageable !== true) {
      throw new Error(
        `You can't use skip clause. The EntitySet ${this._resource.entitySetModel.name} is not pageable.`
      );
    }

    skipNormalized = parseInt(skip, 10);

    if (isNaN(skipNormalized) || skipNormalized < 0) {
      throw new Error(
        `Invalid skip value: "${skip}". Skip has to be positive integer.`
      );
    }

    this.setQueryParameter("$skip", skip);

    return this;
  }

  /**
   * Limit number of values which is returned from the service
   *
   * @param {Number} top is number of records which could to be returned
   *
   * @return {RequestDefinition} itself for the chaining
   *
   * @memberof RequestDefinition
   */
  top(top) {
    if (this._resource.entitySetModel.sap.pageable) {
      if (_.isNumber(top)) {
        this.setQueryParameter("$top", top);
      } else {
        throw new Error(`Invalid top value: "${top}". Top has to be number.`);
      }
    } else {
      throw new Error(
        `The EntitySet ${this._resource.entitySetModel.name} is not pageable.`
      );
    }

    return this;
  }

  /**
   * Caculate path for GET request.
   *
   * @private
   *
   * @memberof RequestDefinition
   */
  calculatePath() {
    const foundResponseType = responseType.determine(this, this._resource);

    if (foundResponseType && _.has(requestPath.calculate, foundResponseType)) {
      this._path = requestPath.calculate[foundResponseType](this);
    } else {
      this._path = requestPath.default(this);
    }
  }

  /**
   * Determines if GET target is list.
   *
   * @returns {bool} true if target can contain multiple values
   *
   * @private
   * @memberof RequestDefinition
   */
  get _isList() {
    return this._resource.isParameterized || !this._isEntity;
  }

  get _isEntity() {
    // Navigation property: If the multiplicity is 1..1 then no key is required and there will always be a single entity result
    let isNavPropSingle =
      _.isFunction(this._resource.isMultiple) && !this._resource.isMultiple();
    return (
      _.has(this, "_keyValue") || _.has(this, "_payload") || isNavPropSingle
    );
  }

  /**
   * Set payload definiton for the entity set create/update operations
   *
   * @param {Object} payload plain object with definition payload
   *
   * @return {RequestDefinition} itself for the chaining
   *
   * @memberof RequestDefinition
   */
  payload(payload) {
    this._payload = payload;
    return this;
  }

  /**
   * Populate actions to the service object
   *
   * @param {engine.Action[]} actions array of action defintions
   *
   * @memberof RequestDefinition
   */
  populateActions(actions) {
    this.actions = {};
    _.each(actions, (action) => {
      let name = action.meta.name;
      this.actions[name] = action.createDirectCaller(this._resource);
      if (!this[name]) {
        this[name] = this.actions[name];
      } else {
        this._resource.agent.logger.warn(
          `Actions ${name} is not accessible as shorthand.`
        );
      }
    });
  }

  /**
   * Mark request definition as request for raw value ($value keyword)
   *
   * @param {String} [propertyName] name of property which is asked (if
   *        parameter is not set $value keyword will be use for whole
   *        entity}
   *
   * @return {RequestDefinition} itself for the chaining
   *
   * @memberof RequestDefinition
   */
  value(propertyName) {
    this._isValue = true;
    if (arguments.length > 0) {
      this._valuePropertyName = propertyName;
    }
    return this._resource;
  }
}

module.exports = RequestDefinition;
