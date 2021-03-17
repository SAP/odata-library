"use strict";

const _ = require("lodash");

function definePropertyCollection(owner, property, transformer) {
  let properties = _.get(
    owner.annotation,
    `record.value.${property}.collection`,
    []
  ).map(transformer);
  Object.defineProperty(owner, _.camelCase(property), {
    get: () => properties,
  });
}

/**
 * Envelopes Side Effects type
 *
 * https://github.wdf.sap.corp/odata/vocabularies/blob/master/Common.md#SideEffectsType
 *
 * @class SideEffectsType
 */
class SideEffectsType {
  /**
   * Creates an instance of SideEffectsType.
   * @param {Annotation} [annotation] side effects
   * @param {EntityType} [entityType] target entity type
   * @param {CsdlSchema} [schema] parent schema
   * @memberof SideEffectsType
   */
  constructor(annotation, entityType, schema) {
    Object.defineProperty(this, "annotation", {
      get: () => annotation,
    });

    SideEffectsType._.definePropertyCollection(this, "SourceEntities", (p) =>
      entityType.getNavigationProperty(p)
    );
    SideEffectsType._.definePropertyCollection(this, "SourceProperties", (p) =>
      entityType.getProperty(p)
    );
    SideEffectsType._.definePropertyCollection(this, "TargetEntities", (p) =>
      entityType.getNavigationProperty(p)
    );
    SideEffectsType._.definePropertyCollection(
      this,
      "TargetProperties",
      (p) => {
        let propertyName;
        let navigationPropertyName;
        let foundProperty;
        let isNavigationProperty = _.isString(p) && p.split("/").length === 2;
        if (isNavigationProperty) {
          [navigationPropertyName, propertyName] = p.split("/");
          foundProperty = entityType
            .getNavigationProperty(navigationPropertyName)
            .getTarget(schema)
            .entityType.getProperty(propertyName);
        } else {
          foundProperty = entityType.getProperty(p);
        }
        return foundProperty;
      }
    );
  }
}

SideEffectsType._ = {
  definePropertyCollection: definePropertyCollection,
};

module.exports = SideEffectsType;
