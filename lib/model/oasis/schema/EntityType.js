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
   *
   * @param {Object} rawMetadata raw metadata object for complex type
   * @param {EdmxModel} metaModel root point of metadata in-memory structure
   *
   * @memberof EntityType
   */
  constructor(rawMetadata, metaModel) {
    super(rawMetadata);

    let key;
    Object.defineProperty(this, "key", {
      get: () => {
        if (!key) {
          key = this._createKey(metaModel);
        }
        return key;
      },
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
   * @param {EdmxModel} metaModel root point of metadata in-memory structure
   *
   * @memberof EntityType
   *
   * @private
   */
  _createKey(metaModel) {
    let key;
    let baseType = _.get(this, "raw.$.BaseType");
    let keyDefinition = _.get(this, "raw.Key");

    if (!this.isValidKeyDefinition(baseType, keyDefinition)) {
      // actually this is true only for base types, derived types inherits the key and can't define key entity
      throw new Error(
        `The EntityType ${this.name} has incorrect key definition.`
      );
    }

    if (_.isString(baseType)) {
      key = metaModel.resolveModelPath(baseType).key;
    } else {
      key = keyDefinition[0].PropertyRef.map((pr) =>
        this.getProperty(pr.$.Name)
      );
    }

    return key;
  }

  /**
   * Check if key parameters are correct to build key
   *
   * @param {String} baseType name of OData service base type
   * @param {Object[]} keyDefinition raw key definition
   *
   * @returns {Boolean} returns true for valid parameters
   *
   * @memberof EntityType
   *
   * @private
   */
  isValidKeyDefinition(baseType, keyDefinition) {
    return (
      _.isString(baseType) ||
      (_.isArray(keyDefinition) && keyDefinition.length === 1)
    );
  }
}

module.exports = EntityType;
