"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");

/**
 * Envelops an enumeration type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EnumerationTypeMember
 *
 * @class EnumTypeMemeber
 * @extends {AnnotationTarget}
 */
class EnumTypeMemeber extends AnnotationTarget {
  /**
   * Creates an instance of EnumTypeMemeber.
   * @param {Object} rawMetadata raw metadata object for enum member
   * @memberof EnumTypeMemeber
   */
  constructor(rawMetadata) {
    super(rawMetadata);
    if (!this.name) {
      throw new Error("Name attribute is mandatory for enum type member.");
    }

    if (_.has(rawMetadata.$, "Value")) {
      let value = Number(rawMetadata.$.Value);
      Object.defineProperty(this, "value", {
        get: () => value,
      });
    }
  }
}

module.exports = EnumTypeMemeber;
