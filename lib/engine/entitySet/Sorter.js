"use strict";

const _ = require("lodash");

/**
 * Class to implement sort handling for OData library client.
 *
 * @class Sorter
 */
class Sorter {
  /**
   * Creates an instance of Sorter.
   * @param {Object} entityType information about EntityType parsed from Metadata
   * @param {string} parts parts of the orderby clause
   * @memberof Sorter
   */
  constructor(entityType, parts) {
    Object.defineProperty(this, "parts", {
      value: parts,
      writable: false,
    });

    this.validate(entityType, parts);
  }

  /**
   * Validates the input
   *
   * Checks if all properties are Sortable
   *
   * @param {Object} entityType information about EntityType parsed from Metadata
   * @param {string} parts parts of the orderby clause
   */
  validate(entityType, parts) {
    _.chain(parts)
      .reduce((properties, part) => properties.concat(part.split(" ")), [])
      // Filter out asc/desc keywords
      .filter((property) => property !== "asc" && property !== "desc")
      // Filter out nested properties (eg. $orderby=Rating,Category/Name)
      .filter((property) => property.indexOf("/") === -1)
      .forEach((property) => {
        let metaProp = entityType.getProperty(property);
        if (!metaProp.sap.sortable) {
          throw new Error(
            `Property ${property} cannot be used in orderby clause as it is not sortable`
          );
        }
      })
      .value();
  }

  /**
   * Convert sorter to the URI Component
   *
   * @returns {String} string which contains sorter with encoded characters
   */
  toURIComponent() {
    return encodeURIComponent(_.chain(this.parts).join(",").value());
  }
}

module.exports = Sorter;
