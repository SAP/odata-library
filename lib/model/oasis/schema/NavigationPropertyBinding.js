"use strict";

const AnnotationTarget = require("../annotations/AnnotationTarget");

/**
 * Envelopes navigation property binding.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_NavigationPropertyBinding
 *
 * @class NavigationPropertyBinding
 * @extends {AnnotationTarget}
 */
class NavigationPropertyBinding extends AnnotationTarget {
  /**
   * Creates an instance of NavigationPropertyBinding.
   * @param {Object} rawMetadata raw metadata navigation property binding
   * @memberof NavigationPropertyBinding
   */
  constructor(rawMetadata) {
    super(rawMetadata);

    Object.defineProperty(this, "path", {
      get: () => rawMetadata.$.Path,
    });

    Object.defineProperty(this, "target", {
      get: () => rawMetadata.$.Target,
    });

    if (!this.path) {
      throw new Error(
        "Path attribute is mandatory for navigation property binding."
      );
    }

    if (!this.target) {
      throw new Error(
        "Target attribute is mandatory for navigation property binding."
      );
    }
  }
}

module.exports = NavigationPropertyBinding;
