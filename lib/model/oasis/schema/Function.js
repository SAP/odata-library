"use strict";

const BoundObject = require("./BoundObject");
const _ = require("lodash");

/**
 * Function - service-defined operation.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Function
 *
 * @class Function
 * @extends {BoundObject}
 */
class Function extends BoundObject {
  static SCHEMA_GROUP = "functions";
  /**
   * Creates an instance of Function
   * @param {Object} rawMetadata raw metadata object for a function
   * @memberof Function
   */
  constructor(rawMetadata) {
    super(rawMetadata);

    Object.defineProperty(this, "isComposable", {
      get: () => rawMetadata.$.IsComposable === "true",
    });
  }

  _checkConsistency() {
    super._checkConsistency();

    if (!_.isArray(this.raw.ReturnType) || this.raw.ReturnType.length !== 1) {
      throw new Error(
        `Function ${this.name} must contain one ReturnType element`
      );
    }
  }
}

module.exports = Function;
