"use strict";

/**
 * Envelops a collection type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Type
 *
 * @class CollectionType
 */
class CollectionType {
  /**
   * Creates an instance of CollectionType.
   * @param {EdmSimpleType|ComplexType} [elementType] type of collection element
   * @memberof CollectionType
   */
  constructor(elementType) {
    Object.defineProperty(this, "elementType", {
      get: () => elementType,
    });
  }
}

module.exports = CollectionType;
