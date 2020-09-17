"use strict";

const AnnotationTarget = require("../annotations/AnnotationTarget");

/**
 * Envelops an On-Delete Action.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_OnDeleteAction
 *
 * @class OnDeleteAction
 * @extends {AnnotationTarget}
 */
class OnDeleteAction extends AnnotationTarget {
  /**
   * Creates an instance of OnDeleteAction.
   * @param {Object} rawMetadata raw metadata object for enum member
   * @memberof OnDeleteAction
   */
  constructor(rawMetadata) {
    super(rawMetadata);
    Object.defineProperty(this, "action", {
      get: () => rawMetadata.$.Action,
    });

    if (!this.action) {
      throw new Error("Action attribute is mandatory for On-Delete Action.");
    }

    if (!["Cascade", "None", "SetNull", "SetDefault"].includes(this.action)) {
      throw new Error(
        `Action attribute value '${this.action}' is not valid in On-Delete Action.`
      );
    }
  }
}

module.exports = OnDeleteAction;
