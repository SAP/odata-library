"use strict";

const AnnotationTarget = require("../annotations/AnnotationTarget");

/**
 * Envelops a referential constraint.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ReferentialConstraint
 *
 * @class ReferentialConstraint
 * @extends {AnnotationTarget}
 */
class ReferentialConstraint extends AnnotationTarget {
  /**
   * Creates an instance of ReferentialConstraint.
   * @param {Object} rawMetadata raw metadata object for enum member
   * @memberof ReferentialConstraint
   */
  constructor(rawMetadata) {
    super(rawMetadata);
    Object.defineProperty(this, "property", {
      get: () => rawMetadata.$.Property,
    });

    Object.defineProperty(this, "referencedProperty", {
      get: () => rawMetadata.$.ReferencedProperty,
    });

    if (!this.property) {
      throw new Error(
        "Property attribute is mandatory for ReferentialConstraint."
      );
    }

    if (!this.referencedProperty) {
      throw new Error(
        "ReferencedProperty attribute is mandatory for ReferentialConstraint."
      );
    }
  }
}

module.exports = ReferentialConstraint;
