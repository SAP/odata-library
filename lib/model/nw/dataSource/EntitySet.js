"use strict";

const AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");

function areNamesCorrelated(srcEntity, targetEntity) {
  let nameCore = /^(.*)Parameters$/.exec(srcEntity.name)[1];
  return nameCore && targetEntity && targetEntity.name === `${nameCore}Type`;
}

/**
 * Finds Determine if navigation property is values association by target 'sap:semantics' attribute.
 * Workd in analytical services.
 *
 * @param {EntityType} entityType parametric entity type
 * @param {CsdlSchema} schema schema for resolving references
 *
 * @returns {NavigationProperty} values association navigation property, if found
 */
function findValuesAssociationBySemantics(entityType, schema) {
  return entityType.navigationProperties.find((navigationProperty) => {
    let target = schema
      .resolveModelPath(navigationProperty.relationship)
      .ends.find((end) => end.type !== entityType);
    return target && target.type.sap.semantics === "aggregate";
  });
}

/**
 * Finds values association by name.
 *
 * If parametrized entity is used in transactional OData service, then the results entity type
 * doesn't have sap:semantics attribute but the association is named 'Set' and the results type
 * is named 'xxxType' for 'xxxParameters' type.
 *
 * @param {EntityType} entityType parametric entity type
 * @param {CsdlSchema} schema schema for resolving references
 *
 * @returns {NavigationProperty} values association navigation property, if found
 */
function findValueAssociationByName(entityType, schema) {
  return entityType.navigationProperties.find(
    (navigationProperty) =>
      navigationProperty.name === "Set" &&
      areNamesCorrelated(
        entityType,
        schema
          .resolveModelPath(navigationProperty.relationship)
          .ends.find((end) => end.type !== entityType).type
      )
  );
}

function findValueAssociation(entityType, schema) {
  return (
    findValuesAssociationBySemantics(entityType, schema) ||
    findValueAssociationByName(entityType, schema)
  );
}

/**
 * Envelops an entity set.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/4a09a48c-1da3-4d84-87b4-2b6c46731470
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntitySet
 *
 * @class EntitySet
 * @extends {AnnotationTarget}
 */
class EntitySet extends AnnotationTarget {
  /**
   * Creates an instance of AssociationEnd.
   * @param {Object} rawMetadata raw metadata object for the association end
   * @param {CsdlSchema} schema to resolve association reference
   * @memberof EntitySet
   */
  constructor(rawMetadata, schema) {
    super(rawMetadata);

    let entityType = schema.resolveModelPath(rawMetadata.$.EntityType);
    Object.defineProperty(this, "entityType", {
      get: () => entityType,
    });
  }

  /**
   * Gets info on parameterization of the entity set
   *
   * @param {CsdlSchema} schema to resolve association reference
   * @returns {Object} info with {Bool} isParameterized and {NavigationProperty} valuesAssociation, if isParameterized is true
   * @memberof EntitySet
   */
  getParameterizationInfo(schema) {
    var info = {
      isParameterized: false,
    };

    if (this.entityType.sap.semantics === "parameters") {
      let valuesAssociation = findValueAssociation(this.entityType, schema);
      if (valuesAssociation) {
        info.isParameterized = true;
        info.valuesAssociation = valuesAssociation;
      }
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
