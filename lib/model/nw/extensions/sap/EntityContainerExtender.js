"use strict";

const ExtenderBase = require("./ExtenderBase");

const ATTRIBUTES_ENTITY_CONTAINER = [
  ["supported-formats", (value) => (value || "atom json").split(" ")],
  ["use-batch", ExtenderBase.defaultFalseBool],
];

const ATTRIBUTES_ENTITY_SET = [
  ["addressable", ExtenderBase.defaultTrueBool],
  ["change-tracking", ExtenderBase.defaultFalseBool],
  ["countable", ExtenderBase.defaultTrueBool],
  ["creatable", ExtenderBase.defaultTrueBool],
  ["deletable", ExtenderBase.defaultTrueBool],
  ["deletable-path"],
  ["delta-link-validity"],
  ["label"],
  ["maxpagesize"],
  ["pageable", ExtenderBase.defaultTrueBool],
  ["requires-filter", ExtenderBase.defaultFalseBool],
  ["searchable", ExtenderBase.defaultFalseBool],
  ["semantics"],
  ["topable", ExtenderBase.defaultTrueBool],
  ["updatable", ExtenderBase.defaultTrueBool],
  ["updatable-path"],
];

const ATTRIBUTES_FUNCTION_IMPORT = [
  ["action-for"],
  ["applicable-path"],
  ["label"],
  ["planning-function"],
];

const ATTRIBUTES_PARAMETER = [["label"]];

const ATTRIBUTES_ASSOCIATION_SET = [
  ["creatable", ExtenderBase.defaultTrueBool],
  ["deletable", ExtenderBase.defaultTrueBool],
  ["updatable", ExtenderBase.defaultTrueBool],
];

function processFunctionImport(functionImport) {
  ExtenderBase.applyAttributeExtension(
    functionImport,
    ATTRIBUTES_FUNCTION_IMPORT
  );
  functionImport.parameters.forEach((p) =>
    ExtenderBase.applyAttributeExtension(p, ATTRIBUTES_PARAMETER)
  );
}

/**
 * Envelope for sap vendor specific extensions for entity container.
 *
 * https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0
 * https://github.com/SAP/odata-vocabularies
 *
 * @class EntityContainerExtender
 */
class EntityContainerExtender {
  /**
   * Process extension for entity type and child elements.
   *
   * @static
   * @param {Object} entityContainer schema element to be processed
   * @memberof EntityContainerExtender
   */
  static process(entityContainer) {
    ExtenderBase.applyAttributeExtension(
      entityContainer,
      ATTRIBUTES_ENTITY_CONTAINER
    );
    entityContainer.entitySets.forEach((es) =>
      ExtenderBase.applyAttributeExtension(es, ATTRIBUTES_ENTITY_SET)
    );
    entityContainer.functionImports.forEach(processFunctionImport);
    entityContainer.associationSets.forEach((fi) =>
      ExtenderBase.applyAttributeExtension(fi, ATTRIBUTES_ASSOCIATION_SET)
    );
  }
}

module.exports = EntityContainerExtender;
