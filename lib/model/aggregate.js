"use strict";

function copyNonSpecialProperties(target, source) {
  Object.getOwnPropertyNames(source)
    .concat(Object.getOwnPropertySymbols(source))
    .forEach((prop) => {
      if (
        !prop.match(
          /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/
        )
      ) {
        Object.defineProperty(
          target,
          prop,
          Object.getOwnPropertyDescriptor(source, prop)
        );
      }
    });
}

function aggregate(BaseClass, ...additionalClasses) {
  let aggregatedClass = class _Combined extends BaseClass {
    constructor(...args) {
      super(...args);
    }
  };

  additionalClasses.forEach((classToAggregate) => {
    copyNonSpecialProperties(
      aggregatedClass.prototype,
      classToAggregate.prototype
    );
    copyNonSpecialProperties(aggregatedClass, classToAggregate);
  });

  return aggregatedClass;
}

aggregate._ = {
  copyNonSpecialProperties: copyNonSpecialProperties,
};

module.exports = aggregate;
