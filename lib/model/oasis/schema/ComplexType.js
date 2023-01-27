"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");
const NavigationProperty = require("./NavigationProperty");
const Property = require("./Property");
const SharedComplexType = require("../../schema/ComplexType");
const aggregate = require("../../aggregate");

/**
 * Envelops a complex type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ComplexType
 *
 * @class ComplexType
 * @extends {AnnotationTarget}
 */
class ComplexType extends aggregate(AnnotationTarget, SharedComplexType) {
  /**
   * Creates an instance of ComplexType.
   * @param {Object} rawMetadata raw metadata object for complex type
   * @memberof ComplexType
   */
  constructor(rawMetadata) {
    super(rawMetadata);
    let properties = _.get(this.raw, "Property", []).map(
      (p) => new Property(p)
    );
    Object.defineProperty(this, "properties", {
      get: () => properties,
    });

    this.navigationProperties = _.get(this.raw, "NavigationProperty", []).map(
      (p) => new NavigationProperty(p)
    );
  }

  /**
   * Initializes schema dependent properties. Decoupled from constructor,
   * because it needs to resolve schema (type) references.
   *
   * @param {CsdlSchema} schema to resolve references
   * @returns {ComplexType} this to allow methods chaining
   * @memberof EntityContainer
   */
  initSchemaDependentProperties(schema) {
    this.properties.forEach((p) => p.initSchemaDependentProperties(schema));
    this.navigationProperties.forEach((np) =>
      np.initSchemaDependentProperties(schema)
    );
    let namespaceQualifiedName = `${schema.namespace}.${this.name}`;
    Object.defineProperty(this, "namespaceQualifiedName", {
      get: () => namespaceQualifiedName,
    });

    return this;
  }

  /**
   * Gets property by its name.
   *
   * @param {string} [name] property name
   * @param {bool} [strict] throw error if not found
   * @returns {Object} property with given name
   * @memberof ComplexType
   * @throws {Error} when property is not found
   */
  getProperty(name, strict = true) {
    let prop = this.properties.find((p) => p.name === name);
    if (!prop && strict) {
      throw new Error(`Property '${name}' not found in type ${this.name}.`);
    }

    return prop;
  }

  /**
   * Gets navigation property by its name.
   *
   * @param {string} [name] navigation property name
   * @param {bool} [strict] throw error if not found
   * @returns {Object} navigation property with given name
   * @memberof EntityType
   * @throws {Error} when navigation property is not found
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
   * Resolves model path within this type.
   *
   * @param {string} [path] model path
   * @returns {Object} model element
   * @memberof EntityType
   */
  resolveModelPath(path) {
    if (!path) {
      return this;
    }

    return (
      this.properties.find((p) => p.name === path) ||
      this.navigationProperties.find((p) => p.name === path)
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
      Properties: _.keyBy(
        this.properties.map((p) => p.getLegacyApiObject()),
        "Name"
      ),
      NavigationProperties: _.keyBy(
        this.navigationProperties.map((np) => np.getLegacyApiObject()),
        "Name"
      ),
    });
  }
}

module.exports = ComplexType;
