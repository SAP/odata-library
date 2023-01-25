"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");
const NavigationPropertyBinding = require("../schema/NavigationPropertyBinding");

/**
 * Envelops an entity set.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntitySet
 *
 * @class EntitySet
 * @extends {AnnotationTarget}
 */
class EntitySet extends AnnotationTarget {
  /**
   * Creates an instance of EntitySet.
   * @param {Object} rawMetadata raw metadata object for the entity set
   * @param {CsdlSchema} schema to resolve entity type reference
   * @memberof EntitySet
   */
  constructor(rawMetadata, schema) {
    super(rawMetadata);

    let entityType = schema.resolveModelPath(rawMetadata.$.EntityType);
    let navigationPropertyBindings = (
      rawMetadata.NavigationPropertyBinding || []
    ).map((npb) => new NavigationPropertyBinding(npb));
    let actions = _.filter(
      schema.actions,
      (action) => action.entityType === rawMetadata.$.EntityType
    );

    Object.defineProperty(this, "entityType", {
      get: () => entityType,
    });

    Object.defineProperty(this, "includeInServiceDocument", {
      get: () => rawMetadata.$.IncludeInServiceDocument !== "false",
    });

    Object.defineProperty(this, "navigationPropertyBindings", {
      get: () => navigationPropertyBindings,
    });

    Object.defineProperty(this, "actions", {
      get: () => actions,
    });
  }

  /**
   * Gets info on parameterization of the entity set
   *
   * @returns {Object} info with {Bool} isParameterized and {NavigationProperty} valuesAssociation, if isParameterized is true
   * @memberof EntitySet
   */
  getParameterizationInfo() {
    var info = {
      isParameterized: false,
    };

    var paramsNavProp = this.entityType.navigationProperties.find(
      (np) =>
        np.name === "Set" && np.containsTarget && np.partner === "Parameters"
    );

    var paramsNavPropBinding = this.navigationPropertyBindings.find(
      (npb) => npb.target === this.name && npb.path === "Set/Parameters"
    );

    if (paramsNavProp && paramsNavPropBinding) {
      info.isParameterized = true;
      info.valuesAssociation = paramsNavProp;
    }

    return info;
  }

  /**
   * Gets legacy api object. (XML casing, maybe some other changes.)
   *
   * @returns {Object} legacy api object
   * @memberof EntityType
   */
  getLegacyApiObject() {
    let api = super.getLegacyApiObject();
    api.EntityType = this.entityType.name;
    return api;
  }
}

module.exports = EntitySet;
