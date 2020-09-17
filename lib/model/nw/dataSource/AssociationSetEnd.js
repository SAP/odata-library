"use strict";

/**
 * Envelops an association set end.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/3c3578f7-9de9-4e7b-9a85-2ed690bab9e7
 * (not present in OASIS-CSDL)
 *
 * @class AssociationSetEnd
 */
class AssociationSetEnd {
  /**
   * Creates an instance of AssociationEnd.
   * @param {Object} rawMetadata raw metadata object for the association end
   * @param {CsdlSchema} schema to resolve association reference
   * @param {Association} association for which the AssociationSet is being defined.
   * @memberof AssociationSetEnd
   */
  constructor(rawMetadata, schema, association) {
    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    let entitySet = schema
      .getEntityContainer()
      .getEntitySet(rawMetadata.$.EntitySet);
    Object.defineProperty(this, "entitySet", {
      get: () => entitySet,
    });

    Object.defineProperty(this, "role", {
      get: () => rawMetadata.$.Role,
    });

    let associationEnd = association.ends.find((e) => e.role === this.role);
    if (!associationEnd) {
      throw new Error(
        `AssociationEnd for role ${this.role} not found in association ${association.name}`
      );
    }

    Object.defineProperty(this, "associationEnd", {
      get: () => associationEnd,
    });
  }
}

module.exports = AssociationSetEnd;
