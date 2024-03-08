"use strict";

const _ = require("lodash");

function applyEntityTypeExtensions(entityType) {
  Object.defineProperty(entityType, "sap", {
    get: () => ({}),
  });

  entityType.properties.forEach((p) =>
    Object.defineProperty(p, "sap", {
      get: () => ({
        sortable: true, // no longer used, SortRestrictions to be used
      }),
    })
  );
}

function isAllowed(entitySet, capability, enabledProperty) {
  let anno = entitySet.annotations.find(
    (a) => a.term === `SAP__capabilities.${capability}`
  );
  return (
    !anno || _.get(anno, `record.value.${enabledProperty}.bool`) !== "false"
  );
}

/**
 * Envelope for vendor specific extensions.
 *
 * SAP extensions implemented
 *
 * https://github.com/SAP/odata-vocabularies
 *
 * @class Extender
 */
class Extender {
  /**
   * Applies available extensions to given schema.
   *
   * @static
   * @param {CsdlSchema} [schema] schema for extension
   * @memberof Extender
   */
  static apply(schema) {
    schema.entityTypes.forEach(applyEntityTypeExtensions);

    schema.entityContainers.forEach((ec) =>
      ec.entitySets.forEach((es) =>
        Object.defineProperty(es, "sap", {
          get: () => ({
            pageable: true, // by OData v4 definition
            searchable: isAllowed(es, "SearchRestrictions", "Searchable"),
          }),
        })
      )
    );
  }
}

module.exports = Extender;
