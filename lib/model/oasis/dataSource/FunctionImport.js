"use strict";

const AnnotationTarget = require("../annotations/AnnotationTarget");

/**
 * Envelops an action import.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_FunctionImport
 *
 * @class FunctionImport
 * @extends {AnnotationTarget}
 */
class FunctionImport extends AnnotationTarget {
  /**
   * Creates an instance of FunctionImport.
   * @param {Object} rawMetadata raw metadata object for the function import
   * @param {CsdlSchema} schema to resolve function reference
   * @memberof FunctionImport
   */
  constructor(rawMetadata, schema) {
    super(rawMetadata);

    if (!this.name) {
      throw new Error("Name attribute is mandatory for function import.");
    }

    if (!rawMetadata.$.Function) {
      throw new Error("Function attribute is mandatory for function import.");
    }

    let fn = schema.resolveModelPath(rawMetadata.$.Function);
    Object.defineProperty(this, "function", {
      get: () => fn,
    });

    Object.defineProperty(this, "entitySet", {
      get: () => rawMetadata.$.EntitySet,
    });

    Object.defineProperty(this, "includeInServiceDocument", {
      get: () => rawMetadata.$.IncludeInServiceDocument !== "false",
    });
  }
}

module.exports = FunctionImport;
