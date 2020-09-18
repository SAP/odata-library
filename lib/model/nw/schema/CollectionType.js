"use strict";

/**
 * Envelops a collection type.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/989fd3db-92ae-4d33-9ed2-1d0037eef219
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
