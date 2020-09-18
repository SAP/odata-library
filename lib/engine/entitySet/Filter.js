"use strict";

const _ = require("lodash");

/**
 * Class to implement filter handling for OData library client
 *
 * @class Filter
 */
class Filter {
  /**
   * Creates an instance of Filter.
   * @param {String} definition of the filter
   * @memberof Filter
   */
  constructor(definition) {
    Object.defineProperty(this, "definition", {
      value: definition,
      writable: false,
    });

    if (!this.check(definition)) {
      throw new Error(
        `Invalid filter definition ${JSON.stringify(definition)}`
      );
    }
  }

  /**
   * Check definition of the filter
   *
   * @param {String} definition of the filter
   *
   * @returns {Boolean} returns true if definition is correct
   *
   * @memberof Filter
   */
  check(definition) {
    let correct = false;
    if (_.isString(definition)) {
      correct = true;
    }
    return correct;
  }

  /**
   * Convert filter to the URI Component
   *
   * @returns {String} string which contains filter with encoded characters
   *
   * @memberof Filter
   */
  toURIComponent() {
    let encodedFilter;
    if (_.isString(this.definition)) {
      if (!this.definition.match(/%[0-9a-f]{2}/)) {
        encodedFilter = encodeURIComponent(this.definition);
      } else {
        encodedFilter = this.definition;
      }
    }
    return encodedFilter;
  }
}

module.exports = Filter;
