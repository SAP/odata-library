"use strict";

const _ = require("lodash");
const ComplexType = require("./ComplexType");

/**
 * Envelops an entity type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntityType
 *
 * @class EntityType
 * @extends {ComplexType}
 */
class EntityType extends ComplexType {
  /**
   * Creates an instance of EntityType.
   * @param {Object} rawMetadata raw metadata object for complex type
   * @memberof EntityType
   */
  constructor(rawMetadata) {
    super(rawMetadata);

    let key = this._createKey();
    Object.defineProperty(this, "key", {
      get: () => key,
    });
  }

  /**
   * Gets legacy api object. (XML casing, maybe some other changes.)
   *
   * @returns {Object} legacy api object
   * @memberof EntityType
   */
  getLegacyApiObject() {
    return Object.assign(super.getLegacyApiObject(), {
      Key: this.key.map((p) => p.getLegacyApiObject()),
    });
  }

  /**
   * Creates entity type 'key' property.
   *
   * @returns {Property[]} array of properties that defines entity key
   *
   * @memberof EntityType
   *
   * @private
   */
  _createKey() {
    if (
      !_.has(this.raw, "Key") ||
      !_.isArray(this.raw.Key) ||
      this.raw.Key.length !== 1
    ) {
      // actually this is true only for base types, derived types inherits the key and can't define key entity
      throw new Error(
        `The EntityType ${this.name} has incorrect key definition.`
      );
    }

    return this.raw.Key[0].PropertyRef.map((pr) => this.getProperty(pr.$.Name));
  }
}

module.exports = EntityType;
