"use strict";

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
          }),
        })
      )
    );
  }
}

module.exports = Extender;
