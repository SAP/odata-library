"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");
const Parameter = require("./Parameter");
const ReturnType = require("./ReturnType");

/**
 * Function - service-defined operation.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Function
 *
 * @class Function
 * @extends {AnnotationTarget}
 */
class Function extends AnnotationTarget {
  /**
   * Creates an instance of Function
   * @param {Object} rawMetadata raw metadata object for a function
   * @memberof Function
   */
  constructor(rawMetadata) {
    super(rawMetadata);
    if (!this.name) {
      throw new Error("Name attribute is mandatory for function.");
    }

    if (
      !_.isArray(rawMetadata.ReturnType) ||
      rawMetadata.ReturnType.length !== 1
    ) {
      throw new Error(
        `Function ${this.name} must contain one ReturnType element`
      );
    }

    let returnType = new ReturnType(rawMetadata.ReturnType[0]);
    Object.defineProperty(this, "returnType", {
      get: () => returnType,
    });

    let parameters = (rawMetadata.Parameter || []).map(
      (md) => new Parameter(md)
    );
    Object.defineProperty(this, "parameters", {
      get: () => parameters,
    });

    Object.defineProperty(this, "isBound", {
      get: () => rawMetadata.$.IsBound === "true",
    });

    Object.defineProperty(this, "isComposable", {
      get: () => rawMetadata.$.IsComposable === "true",
    });

    Object.defineProperty(this, "entitySetPath", {
      get: () => rawMetadata.$.EntitySetPath,
    });
  }

  /**
   * Initializes schema dependent properties. Decoupled from constructor,
   * because it needs to resolve schema (type) references.
   *
   * @param {CsdlSchema} schema to resolve references
   * @returns {Function} this to allow methods chaining
   * @memberof Function
   */
  initSchemaDependentProperties(schema) {
    this.returnType.initSchemaDependentProperties(schema);
    this.parameters.forEach((p) => p.initSchemaDependentProperties(schema));
    return this;
  }

  /**
   * Resolves model path within this type.
   *
   * @returns {Object} itself
   * @memberof Function
   */
  resolveModelPath() {
    return this;
  }
}

module.exports = Function;
