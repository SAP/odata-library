"use strict";

const AnnotationTarget = require("../annotations/AnnotationTarget");

/**
 * Envelops an action import.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ActionImport
 *
 * @class ActionImport
 * @extends {AnnotationTarget}
 */
class ActionImport extends AnnotationTarget {
  /**
   * Creates an instance of ActionImport.
   * @param {Object} rawMetadata raw metadata object for the action import
   * @param {CsdlSchema} schema to resolve action reference
   * @memberof ActionImport
   */
  constructor(rawMetadata, schema) {
    super(rawMetadata);

    if (!this.name) {
      throw new Error("Name attribute is mandatory for action import.");
    }

    if (!rawMetadata.$.Action) {
      throw new Error("Action attribute is mandatory for action import.");
    }

    let action = schema.resolveModelPath(rawMetadata.$.Action);
    Object.defineProperty(this, "action", {
      get: () => action,
    });

    Object.defineProperty(this, "entitySet", {
      get: () => rawMetadata.$.EntitySet,
    });
  }
}

module.exports = ActionImport;
