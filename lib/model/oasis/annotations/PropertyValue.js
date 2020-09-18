"use strict";

const _ = require("lodash");

/**
 * Envelops an Property Value. (OASIS-CSDL)
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#_Toc501463385
 * (https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/cc1d9892-120e-4446-aa05-79db89897f4f)
 *
 * @class PropertyValue
 */
class PropertyValue {
  /**
   * Creates an instance of PropertyValue.
   * @param {Object} rawMetadata raw metadata object for the record
   * @param {Object} expressionBuilder expression builder for creating value objects
   * @memberof PropertyValue
   */
  constructor(rawMetadata, expressionBuilder) {
    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    let property = rawMetadata.$ ? rawMetadata.$.Property : undefined;
    Object.defineProperty(this, "property", {
      get: () => property,
    });

    if (!this.property) {
      throw new Error("PropertyValue must contain attribute Property.");
    }

    expressionBuilder.assignElementValue(
      this,
      `PropertyValue '${this.property}'`
    );

    let annotations = _.get(this.raw, "Annotation", []).map(
      expressionBuilder.buildAnnotation
    );
    Object.defineProperty(this, "annotations", {
      get: () => annotations,
    });
  }
}

module.exports = PropertyValue;
