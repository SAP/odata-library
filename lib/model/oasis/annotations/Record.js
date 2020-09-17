"use strict";

const _ = require("lodash");

/**
 * Envelops an Record Expression. (OASIS-CSDL)
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Record
 * (https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/acee574d-2fe1-4da7-a65e-acf35643eb1d)
 *
 * @class Record
 */
class Record {
  /**
   * Creates an instance of Record.
   * @param {Object} rawMetadata raw metadata object for the record
   * @param {Object} expressionBuilder expression builder for creating value objects
   * @memberof Record
   */
  constructor(rawMetadata, expressionBuilder) {
    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    let type = rawMetadata.$ ? rawMetadata.$.Type : undefined;
    Object.defineProperty(this, "type", {
      get: () => type,
    });

    let annotations = _.get(this.raw, "Annotation", []).map(
      expressionBuilder.buildAnnotation
    );
    Object.defineProperty(this, "annotations", {
      get: () => annotations,
    });

    let propertyValues = _.get(this.raw, "PropertyValue", []).map(
      expressionBuilder.buildPropertyValue
    );
    Object.defineProperty(this, "propertyValues", {
      get: () => propertyValues,
    });

    let value = _.keyBy(propertyValues, "property");
    Object.defineProperty(this, "value", {
      get: () => value,
    });
  }
}

module.exports = Record;
