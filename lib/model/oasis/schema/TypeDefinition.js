"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");

/**
 * Envelops a type definition, i.e. primitive type specialization. SRID not implemented.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_TypeDefinition
 *
 * @class TypeDefinition
 * @extends {AnnotationTarget}
 */
class TypeDefinition extends AnnotationTarget {
  /**
   * Creates an instance of TypeDefinition.
   * @param {Object} rawMetadata raw metadata object for type definition
   * @memberof TypeDefinition
   */
  constructor(rawMetadata) {
    super(rawMetadata);

    this._checkConsistency();

    let maxLength = _.has(rawMetadata.$, "MaxLength")
      ? Number(rawMetadata.$.MaxLength)
      : undefined;
    Object.defineProperty(this, "maxLength", {
      get: () => maxLength,
    });

    let precision = _.has(rawMetadata.$, "Precision")
      ? Number(rawMetadata.$.Precision)
      : undefined;
    Object.defineProperty(this, "precision", {
      get: () => precision,
    });

    let scale = _.has(rawMetadata.$, "Scale")
      ? Number(rawMetadata.$.Scale)
      : undefined;
    Object.defineProperty(this, "scale", {
      get: () => scale,
    });

    Object.defineProperty(this, "unicode", {
      get: () => rawMetadata.$.Unicode !== "false",
    });
  }

  /**
   * Initializes schema dependent properties. Decoupled from constructor,
   * because it needs to resolve schema (type) references.
   *
   * @param {CsdlSchema} schema to resolve references
   * @memberof ReturnType
   */
  initSchemaDependentProperties(schema) {
    Object.defineProperty(this, "underlyingType", {
      get: () => schema.getType(this.raw.$.UnderlyingType),
    });
  }

  _checkConsistency() {
    if (!this.name) {
      throw new Error("Name attribute is mandatory for type definition.");
    }

    if (!this.raw.$.UnderlyingType) {
      throw new Error(
        "UnderlyingType attribute is mandatory for type definition."
      );
    }
  }
}

module.exports = TypeDefinition;
