"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");
const SharedComplexType = require("../../schema/ComplexType");
const aggregate = require("../../aggregate");
const Property = require("./Property");

/**
 * Envelops a complex type.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/ceb3ffc2-812c-4cd9-98e8-184deffa9b09
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ComplexType
 *
 * @class ComplexType
 * @extends {AnnotationTarget}
 */
class ComplexType extends aggregate(AnnotationTarget, SharedComplexType) {
  /**
   * Creates an instance of ComplexType.
   *
   * @param {Object} rawMetadata raw metadata object for complex type
   * @param {Object} model reference to model which owns the schema
   *
   * @memberof ComplexType
   */
  constructor(rawMetadata, model) {
    super(rawMetadata, model);
    let properties = _.get(this.raw, "Property", []).map(
      (p) => new Property(p)
    );
    Object.defineProperty(this, "properties", {
      get: () => properties,
    });
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
   * @returns {Object} property with given name or undefined, if property doesn't exist
   * @memberof ComplexType
   */
  getProperty(name, strict = true) {
    let property;
    let properties;

    const propertyNameParts = name.split("/");
    const propertyName = propertyNameParts[propertyNameParts.length - 1];
    const navigationPropertyName = propertyNameParts[0];

    if (propertyNameParts.length === 1) {
      properties = this.properties;
    } else {
      properties = _.chain(this.navigationProperties)
        .filter((np) => navigationPropertyName === np.name)
        .map((navigationProperty) => {
          const associationEnd = this.model.resolveModelPath(
            navigationProperty.relationship
          );
          return _.get(associationEnd, "ends.1.type.properties", []);
        })
        .get(0, [])
        .value();
    }
    property = properties.find((p) => p.name === propertyName);

    if (!property && strict) {
      throw new Error(`Property '${name}' not found in type ${this.name}.`);
    }

    return property;
  }

  /**
   * Resolves model path within this type.
   *
   * @param {string} [path] model path
   * @returns {Object} resolved element
   * @memberof ComplexType
   */
  resolveModelPath(path) {
    return path ? this.properties.find((p) => p.name === path) : this;
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
    });
  }
}

module.exports = ComplexType;
