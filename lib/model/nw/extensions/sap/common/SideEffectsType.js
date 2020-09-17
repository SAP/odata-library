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
   * @memberof SideEffectsType
   */
  constructor(annotation, entityType) {
    Object.defineProperty(this, "annotation", {
      get: () => annotation,
    });

    definePropertyCollection(this, "SourceEntities", (p) =>
      entityType.getNavigationProperty(p)
    );
    definePropertyCollection(this, "SourceProperties", (p) =>
      entityType.getProperty(p)
    );
    definePropertyCollection(this, "TargetEntities", (p) =>
      entityType.getNavigationProperty(p)
    );
    definePropertyCollection(this, "TargetProperties", (p) =>
      entityType.getProperty(p)
    );
  }
}

module.exports = SideEffectsType;
