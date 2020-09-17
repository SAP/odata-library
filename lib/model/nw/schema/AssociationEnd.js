"use strict";

/**
 * Envelops an association end.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/f5fec50d-2930-4265-945d-965cd4db8153
 * (not present in OASIS-CSDL)
 *
 * @class AssociationEnd
 */
class AssociationEnd {
  /**
   * Creates an instance of AssociationEnd.
   * @param {Object} rawMetadata raw metadata object for the association end
   * @memberof AssociationEnd
   */
  constructor(rawMetadata) {
    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    Object.defineProperty(this, "multiplicity", {
      get: () => rawMetadata.$.Multiplicity,
    });

    Object.defineProperty(this, "role", {
      get: () => rawMetadata.$.Role,
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
}

module.exports = AssociationEnd;
