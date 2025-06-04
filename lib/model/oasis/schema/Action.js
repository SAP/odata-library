"use strict";

const BoundObject = require("./BoundObject");
const _ = require("lodash");

/**
 * Action - service-defined operation.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Action
 *
 * @class Action
 * @extends {BoundObject}
 */
class Action extends BoundObject {
  static SCHEMA_GROUP = "actions";

  /**
   * Checks properties consistency, i.e. mandatory properties, return type.
   *
   * @memberof Action
   */
  _checkConsistency() {
    super._checkConsistency();

    if (_.isArray(this.raw.ReturnType) && this.raw.ReturnType.length !== 1) {
      throw new Error(
        `Action ${this.name} may contain at most one ReturnType element`
      );
    }
  }
}

module.exports = Action;
