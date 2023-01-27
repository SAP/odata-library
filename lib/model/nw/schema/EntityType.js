"use strict";

const _ = require("lodash");
const ComplexType = require("./ComplexType");
const NavigationProperty = require("./NavigationProperty");

/**
 * Envelops an entity type.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/6875ce6c-837c-4cea-8e35-441dc2366008
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntityType
 *
 * @class EntityType
 * @extends {ComplexType}
 */
class EntityType extends ComplexType {
  /**
   * Creates an instance of EntityType.
   *
   * @param {Object} rawMetadata raw metadata object for complex type
   * @param {Object} model reference to model which owns the entity type
   *
   * @memberof EntityType
   */
  constructor(rawMetadata, model) {
    super(rawMetadata, model);

    let key = this._createKey();
    Object.defineProperty(this, "key", {
      get: () => key,
    });

    Object.defineProperty(this, "hasStream", {
      get: () => {
        return _.get(rawMetadata, "$.m:HasStream") === "true";
      },
    });

    let navigationProperties = _.get(this.raw, "NavigationProperty", []).map(
      (p) => new NavigationProperty(p, model)
    );
    Object.defineProperty(this, "navigationProperties", {
      get: () => navigationProperties,
    });
  }

  /**
   * Gets navigation property by its name.
   *
   * @param {string} [name] navigation property name
   * @param {bool} [strict] throw error if not found
   * @returns {Object} navigation property with given name or undefined, if property doesn't exist
   * @memberof EntityType
   */
  getNavigationProperty(name, strict = true) {
    let prop = this.navigationProperties.find((p) => p.name === name);
    if (!prop && strict) {
      throw new Error(
        `NavigationProperty '${name}' not found in entity type ${this.name}.`
      );
    }

    return prop;
  }

  /**
   * Gets entity type parameter. (SAP specific, used for implementing parametrized entity sets.)
   *
   * @param {string} [name] parameter name
   * @param {CsdlSchema} [schema] schema for resolving references
   * @returns {Object} parameter or undefined
   * @memberof EntityType
   */
  getParameter(name, schema) {
    let param;
    let parameters = this.navigationProperties.find(
      (p) => p.name === "Parameters"
    );
    if (parameters) {
      let paramEntity = schema
        .resolveModelPath(parameters.relationship)
        .ends.map((end) => end.type)
        .find((entityType) => entityType !== this);

      param = paramEntity.resolveModelPath(name);
    }

    return param;
  }

  /**
   * Resolves model path within this type.
   *
   * @param {string} [path] model path
   * @param {CsdlSchema} [schema] schema for resolving references
   * @returns {Object} model element
   * @memberof EntityType
   */
  resolveModelPath(path, schema) {
    if (!path) {
      return this;
    }

    return (
      super.resolveModelPath(path) ||
      this.navigationProperties.find((p) => p.name === path) ||
      this.getParameter(path, schema)
    );
  }

  /**
   * Gets legacy api object. (XML casing, maybe some other changes.)
   *
   * @returns {Object} legacy api object
   * @memberof EntityType
   */
  getLegacyApiObject() {
    return Object.assign(super.getLegacyApiObject(), {
      Key: this.key.map((p) => p.getLegacyApiObject()),
      NavigationProperties: _.keyBy(
        this.navigationProperties.map((np) => np.getLegacyApiObject()),
        "Name"
      ),
    });
  }

  /**
   * Creates entity type 'key' property.
   *
   * @returns {Property[]} array of properties that defines entity key
   *
   * @memberof EntityType
   *
   * @private
   */
  _createKey() {
    if (
      !_.has(this.raw, "Key") ||
      !_.isArray(this.raw.Key) ||
      this.raw.Key.length !== 1
    ) {
      // actually this is true only for base types, derived types inherits the key and can't define key entity
      throw new Error(
        `The EntityType ${this.name} has incorrect key definition.`
      );
    }

    return this.raw.Key[0].PropertyRef.map((pr) => this.getProperty(pr.$.Name));
  }
}

module.exports = EntityType;
