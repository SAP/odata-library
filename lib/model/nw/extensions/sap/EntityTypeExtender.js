"use strict";

const ExtenderBase = require("./ExtenderBase");
const SideEffectsType = require("./common/SideEffectsType");
const ValueListType = require("./common/ValueListType");
const DataField = require("./ui/DataField");

const ATTRIBUTES_ENTITY_TYPE = [["label"], ["semantics"]];

const ATTRIBUTES_NAVIGATION_PROPERTY = [
  ["creatable", ExtenderBase.defaultTrueBool],
  ["creatable-path"],
  ["filterable", ExtenderBase.defaultTrueBool],
];

const ATTRIBUTES_PROPERTY = [
  ["aggregation-role"],
  ["attribute-for"],
  ["creatable", ExtenderBase.defaultTrueBool],
  ["display-format"],
  ["field-control"],
  ["filter-for"],
  ["filter-restriction"],
  ["filterable", ExtenderBase.defaultTrueBool],
  ["heading"],
  ["hierarchy-drill-state-for"],
  ["hierarchy-level-for"],
  ["hierarchy-node-descendant-count-for"],
  ["hierarchy-node-external-key-for"],
  ["hierarchy-node-for"],
  ["hierarchy-parent-navigation-for"],
  ["hierarchy-parent-node-for"],
  ["hierarchy-preorder-rank-for"],
  ["hierarchy-sibling-rank-for"],
  ["is-annotation", ExtenderBase.defaultFalseBool],
  ["label"],
  ["lower-boundary"],
  ["parameter"],
  ["precision"],
  ["preserve-flag-for"],
  ["quickinfo"],
  ["required-in-filter", ExtenderBase.defaultFalseBool],
  ["semantics"],
  ["sortable", ExtenderBase.defaultTrueBool],
  ["super-ordinate"],
  ["text"],
  ["unit"],
  ["updatable", ExtenderBase.defaultTrueBool],
  ["updatable-path"],
  ["upper-boundary"],
  ["validation-regexp"],
  ["value-list"],
  ["visible", ExtenderBase.defaultTrueBool],
];

function createPropertyExtension(property, schema, settings) {
  let extension = ExtenderBase.createAttributeExtension(
    property,
    ATTRIBUTES_PROPERTY
  );
  let valueLists = property.annotations
    .filter((a) => a.term === "Common.ValueList")
    .map((a) => new ValueListType(a, schema, settings));
  Object.defineProperty(extension, "valueLists", {
    get: () => valueLists,
  });

  return extension;
}

function createEntityTypeCommonExtension(entityType, schema, settings) {
  return {
    sideEffects: entityType.annotations
      .filter((a) => a.term === "Common.SideEffects")
      .map((a) => new SideEffectsType(a, entityType, schema, settings)),
  };
}

function createEntityTypeUIExtension(entityType) {
  return {
    selectionFields: (
      entityType.annotations
        .filter((a) => a.term === "UI.SelectionFields")
        .map((a) => a.collection)[0] || []
    ).map((p) => entityType.getProperty(p)),

    lineItems: (
      entityType.annotations
        .filter((a) => a.term === "UI.LineItem")
        .map((a) => a.collection)[0] || []
    ).map((r) => new DataField(r, entityType)),
  };
}

/**
 * Envelope for sap vendor specific extensions for entity types.
 *
 * https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0
 * https://github.com/SAP/odata-vocabularies
 *
 * @class EntityTypeExtender
 */
class EntityTypeExtender {
  /**
   * Process extension for entity type and child elements.
   *
   * @static
   * @param {Object} entityType schema element to be processed
   * @param {CsdlSchema} [schema] schema for extension
   * @param {Object} [settings] sparsing settings
   * @memberof EntityTypeExtender
   */
  static process(entityType, schema, settings) {
    ExtenderBase.applyAttributeExtension(entityType, ATTRIBUTES_ENTITY_TYPE);

    entityType.sap.common = createEntityTypeCommonExtension(
      entityType,
      schema,
      settings
    );
    entityType.sap.ui = createEntityTypeUIExtension(entityType);

    entityType.properties.forEach((p) =>
      ExtenderBase.applyExtension(
        p,
        createPropertyExtension(p, schema, settings)
      )
    );

    entityType.navigationProperties.forEach((np) =>
      ExtenderBase.applyAttributeExtension(np, ATTRIBUTES_NAVIGATION_PROPERTY)
    );
  }
}

EntityTypeExtender._ = {
  createEntityTypeCommonExtension: createEntityTypeCommonExtension,
};

module.exports = EntityTypeExtender;
