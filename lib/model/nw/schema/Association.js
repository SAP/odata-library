"use strict";

const _ = require("lodash");
const AssociationEnd = require("./AssociationEnd");

/**
 * Envelops an association.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/77d7ccbb-bda8-444a-a160-f4581172322f
 * (not present in OASIS-CSDL)
 *
 * @class Association
 */
class Association {
  /**
   * Creates an instance of Association.
   * @param {Object} rawMetadata raw metadata object for the association
   * @memberof Association
   */
  constructor(rawMetadata) {
    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    Object.defineProperty(this, "name", {
      get: () => rawMetadata.$.Name,
    });

    let ends = _.get(rawMetadata, "End", []).map((p) => new AssociationEnd(p));
    Object.defineProperty(this, "ends", {
      get: () => ends,
    });

    if (ends.length !== 2) {
      throw new Error(
        `Association MUST have exactly two End elements defined, but it has ${ends.length}.`
      );
    }
  }

  /**
   * Initializes schema dependent properties. Decoupled from constructor,
   * because it needs to resolve schema (type) references.
   *
   * @param {CsdlSchema} schema to resolve references
   * @memberof EntityContainer
   */
  initSchemaDependentProperties(schema) {
    this.ends.forEach((e) => e.initSchemaDependentProperties(schema));
  }

  /**
   * Resolves model path within this association.
   *
   * @param {string} [path] model path
   * @returns {Object} resolved element
   * @memberof ComplexType
   */
  resolveModelPath(path) {
    return !path || path === this.name ? this : undefined;
  }

  /**
   * Find endpoint of the association
   *
   * @param {String} role identifer of the role which need to be find
   *
   * @returns {AssociationEnd} found endpoint of the association
   *
   * @memberof Association
   */
  findEnd(role) {
    return _.find(this.ends, (associationEnd) => associationEnd.role === role);
  }
}

module.exports = Association;
