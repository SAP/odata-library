"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");
const EnumTypeMemeber = require("./EnumTypeMemeber");

/**
 * Envelops an enumeration type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EnumerationType
 *
 * @class EnumType
 * @extends {AnnotationTarget}
 */
class EnumType extends AnnotationTarget {
  /**
   * Creates an instance of EnumType.
   * @param {Object} rawMetadata raw metadata object for enum type
   * @memberof EnumType
   */
  constructor(rawMetadata) {
    super(rawMetadata);

    Object.defineProperty(this, "isFlags", {
      get: () => rawMetadata.$.IsFlags === "true",
    });

    let underlyingType = rawMetadata.$.UnderlyingType || "Edm.Int32";
    Object.defineProperty(this, "underlyingType", {
      get: () => underlyingType,
    });

    let members = (rawMetadata.Memeber || []).map(
      (m) => new EnumTypeMemeber(m)
    );
    Object.defineProperty(this, "members", {
      get: () => members,
    });

    this._checkConsistency();
    this._checkMembers();
  }

  _checkConsistency() {
    if (!this.name) {
      throw new Error("Name attribute is mandatory for enum type.");
    }

    if (
      ![
        "Edm.Byte",
        "Edm.SByte",
        "Edm.Int16",
        "Edm.Int32",
        "Edm.Int64",
      ].includes(this.underlyingType)
    ) {
      throw new Error(
        `Unsupported UnderlyingType attribute for EnumType ${this.name}: ${this.underlyingType}`
      );
    }
  }

  _checkMembers() {
    let hasValue = _.uniq(this.members.map((m) => _.has(m, "value")));
    if (hasValue.length > 1) {
      throw new Error(
        `EnumType ${this.name}: Either all or none of enum members should specify value.`
      );
    }

    if (this.isFlags && hasValue.length > 0 && !hasValue[0]) {
      throw new Error(
        `EnumType ${this.name}: If the IsFlags attribute has a value of true, a non-negative integer value MUST be specified for the Value attribute.`
      );
    }
  }
}

module.exports = EnumType;
