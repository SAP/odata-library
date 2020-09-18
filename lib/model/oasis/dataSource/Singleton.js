"use strict";

const AnnotationTarget = require("../annotations/AnnotationTarget");
const NavigationPropertyBinding = require("../schema/NavigationPropertyBinding");

/**
 * Envelops an action import.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Singleton
 *
 * @class Singleton
 * @extends {AnnotationTarget}
 */
class Singleton extends AnnotationTarget {
  /**
   * Creates an instance of Singleton.
   * @param {Object} rawMetadata raw metadata object for the singleton
   * @param {CsdlSchema} schema to resolve type reference
   * @memberof Singleton
   */
  constructor(rawMetadata, schema) {
    super(rawMetadata);

    if (!this.name) {
      throw new Error("Name attribute is mandatory for singleton.");
    }

    if (!rawMetadata.$.Type) {
      throw new Error("Type attribute is mandatory for singleton.");
    }

    let type = schema.resolveModelPath(rawMetadata.$.Type);
    Object.defineProperty(this, "type", {
      get: () => type,
    });

    let navigationPropertyBindings = (
      rawMetadata.NavigationPropertyBinding || []
    ).map((npb) => new NavigationPropertyBinding(npb));
    Object.defineProperty(this, "navigationPropertyBindings", {
      get: () => navigationPropertyBindings,
    });
  }
}

module.exports = Singleton;
