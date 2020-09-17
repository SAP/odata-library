"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");

/**
 * Envelops a (structural) property.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_StructuralProperty
 *
 * Geometry or geography property not supported (SRID attribute)
 *
 * @class Property
 * @extends {AnnotationTarget}
 */
class Property extends AnnotationTarget {
  /**
   * Creates an instance of Property.
   * @param {Object} rawMetadata raw metadata object for property
   * @memberof Property
   */
  constructor(rawMetadata) {
    super(rawMetadata);

    Object.defineProperty(this, "nullable", {
      get: () => rawMetadata.$.Nullable !== "false",
    });

    // in v 4.0 it is posible to use 'max' symbolic value, it is deprecated in 4.01. Not sure if sap implements 4.0 or 4.01
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

    Object.defineProperty(this, "readOnly", {
      get: () => rawMetadata.$.ReadOnly === "true",
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
   * @memberof AssociationEnd
   */
  initSchemaDependentProperties(schema) {
    Object.defineProperty(this, "type", {
      get: () => schema.getType(this.raw.$.Type),
    });

    if (_.has(this.raw.$, "DefaultValue")) {
      // Values must be represented as defined in OData ABNF Construction Rules, e.g. binary in base64url encoding
      // Edm type implementation doesn't offer such conversion, so leaving as plain string for now
      // also not checking now that type is primitive or enumeration
      Object.defineProperty(this, "defaultValue", {
        get: () => this.raw.$.DefaultValue,
      });
    }
  }

  /**
   * Gets legacy api object. (XML casing, maybe some other changes.)
   *
   * @returns {Object} legacy api object
   * @memberof Property
   */
  getLegacyApiObject() {
    return Object.assign(super.getLegacyApiObject(), {
      MaxLength: this.maxLength,
      Nullable: this.nullable,
      ReadOnly: this.readOnly,
      Type: this.type.namespaceQualifiedName,
    });
  }
}

module.exports = Property;
