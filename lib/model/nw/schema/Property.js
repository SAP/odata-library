"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");

/**
 * Envelops a (structural) property.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/50129087-bb7f-475e-a14d-7a8a4bdef966
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_StructuralProperty
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

    let maxLength = _.has(rawMetadata.$, "MaxLength")
      ? Number(rawMetadata.$.MaxLength)
      : undefined;
    Object.defineProperty(this, "maxLength", {
      get: () => maxLength,
    });

    Object.defineProperty(this, "readOnly", {
      get: () => rawMetadata.$.ReadOnly === "true",
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
