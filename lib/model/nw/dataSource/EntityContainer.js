"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");
const AssociationSet = require("./AssociationSet");
const EntitySet = require("./EntitySet");
const FunctionImport = require("./FunctionImport");

// schema level elements collection
// order is important for initialization because, AssociationSetEnd references EntityType, FunctionImport can reference EntitySet
// (MS-CSDL requires order in xml: FunctionImport, EntitySet, AssociationSet)
const childCollections = [
  {
    name: "entitySets",
    sourceElement: "EntitySet",
    Class: EntitySet,
  },
  {
    name: "associationSets",
    sourceElement: "AssociationSet",
    Class: AssociationSet,
  },
  {
    name: "functionImports",
    sourceElement: "FunctionImport",
    Class: FunctionImport,
  },
];

function initChildProperties(container, schema) {
  childCollections.forEach((collection) => {
    let child = _.get(container.raw, collection.sourceElement, []).map(
      (t) => new collection.Class(t, schema)
    );
    Object.defineProperty(container, collection.name, {
      get: () => child,
    });
  });
}

/**
 * Envelopes an EntityContainer.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/031f2e18-935b-461b-95ce-62e11432047a
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntityContainer
 *
 * @class EntityContainer
 * @extends {AnnotationTarget}
 */
class EntityContainer extends AnnotationTarget {
  /**
   * Creates an instance of EntityContainer.
   * @param {Object} rawMetadata raw metadata object for entity container
   * @memberof EntityContainer
   */
  constructor(rawMetadata) {
    super(rawMetadata);

    let isDefault =
      _.get(rawMetadata.$, "m:IsDefaultEntityContainer", "false") === "true";
    Object.defineProperty(this, "isDefault", {
      get: () => isDefault,
    });
  }

  /**
   * Gets an EntitySet defined in container
   *
   * @param {string} [name] entity set name
   * @returns {EntitySet} set with given name
   * @memberof EntityContainer
   */
  getEntitySet(name) {
    let set = this.entitySets.find((s) => s.name === name);
    if (!set) {
      throw new Error(
        `EntitySet '${name}' not found in entity container '${this.name}'`
      );
    }

    return set;
  }

  /**
   * Gets an FunctionImport defined in container
   *
   * @param {string} [name] function import name
   * @returns {EntitySet} set with given name
   * @memberof EntityContainer
   */
  getFunctionImport(name) {
    let set = this.functionImports.find((s) => s.name === name);
    if (!set) {
      throw new Error(
        `FunctionImport '${name}' not found in entity container '${this.name}'`
      );
    }

    return set;
  }

  /**
   * Initializes entity container child collection properties. Decoupled from constructor,
   * because it needs to resolve schema references and entity container elements.
   *
   * @param {CsdlSchema} schema to resolve references
   * @memberof EntityContainer
   */
  initSchemaDependentProperties(schema) {
    initChildProperties(this, schema);
  }

  /**
   * Resolves model path within this enetity container.
   *
   * @param {strin} [path] model path
   * @returns {Object} resolved container element
   * @memberof EntityContainer
   */
  resolveModelPath(path) {
    return path ? this.entitySets.find((e) => e.name === path) : this;
  }
}

module.exports = EntityContainer;
