"use strict";

const _ = require("lodash");

/**
 * Shared code for nw/oasis ComplexType classes
 *
 * @class ComplexType
 */
class ComplexType {
  formatBody(complexTypeValue) {
    return this.properties
      .filter((entityTypeProperty) =>
        _.has(complexTypeValue, entityTypeProperty.name)
      )
      .reduce((acc, entityTypeProperty) => {
        acc[entityTypeProperty.name] = entityTypeProperty.type.formatBody(
          complexTypeValue[entityTypeProperty.name]
        );
        return acc;
      }, {});
  }
}

module.exports = ComplexType;
