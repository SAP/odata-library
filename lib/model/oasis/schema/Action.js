"use strict";

const BoundObject = require("./BoundObject");
const EntityType = require("./EntityType");
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

  /**
   * Checks whether the action matches the given model path.
   *
   * @param {Object} parsedPath parsed model path
   *
   * @returns {Boolean} true if the action matches the model path
   * @memberof Action
   */
  matchModelPath(parsedPath) {
    let matched;

    if (parsedPath.element === this.name) {
      matched = true;
    } else {
      const parsedElement = parsedPath.element.match(
        `^${this.name}\\(\([^\)]\+\)`
      );
      const boundTypeName = _.get(parsedElement, 1);

      if (boundTypeName) {
        matched = Boolean(this.isBound && this.isBoundByType(boundTypeName));
      } else {
        matched = false;
      }
    }

    return matched;
  }

  /**
   * Checks whether the action is bound by the given type name.
   *
   * @param {String} boundTypeName bound type name to check
   *
   * @returns {Boolean} true if the action is bound by the given type
   * @memberof Action
   */
  isBoundByType(boundTypeName) {
    let found = false;
    const thisParameter = this.parameters.find(
      (param) => param.name === "_it" && param.type instanceof EntityType
    );

    if (thisParameter) {
      found = [this.schema?.namespace, this.schema?.alias].some(
        (prefix) => boundTypeName === prefix + "." + thisParameter.type.name
      );
    }

    return found;
  }
}

module.exports = Action;
