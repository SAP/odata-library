"use strict";

const _ = require("lodash");
const AssociationSetEnd = require("./AssociationSetEnd");

/**
 * Envelops an association set.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/84fdfd02-7b12-4aa3-a2eb-51bab109f439
 * (not present in OASIS-CSDL)
 *
 * @class AssociationSet
 */
class AssociationSet {
  /**
   * Creates an instance of AssociationSet.
   * @param {Object} rawMetadata raw metadata object for the association set
   * @param {CsdlSchema} schema to resolve association reference
   * @memberof Association
   */
  constructor(rawMetadata, schema) {
    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    Object.defineProperty(this, "name", {
      get: () => rawMetadata.$.Name,
    });

    let association = schema.resolveModelPath(rawMetadata.$.Association);
    Object.defineProperty(this, "association", {
      get: () => association,
    });

    let ends = _.get(rawMetadata, "End", []).map(
      (p) => new AssociationSetEnd(p, schema, association)
    );
    Object.defineProperty(this, "ends", {
      get: () => ends,
    });

    if (ends.length !== 2) {
      throw new Error(
        `AssociationSet MUST have exactly two End elements defined, but it has ${ends.length}.`
      );
    }

    let extensions = [];
    Object.defineProperty(this, "extensions", {
      get: () => extensions,
    });
  }

  getEndByRole(role) {
    let end = this.ends.find((e) => e.role === role);
    if (!end) {
      throw new Error(`AssociationSet end with role ${role} not found.`);
    }

    return end;
  }
}

module.exports = AssociationSet;
