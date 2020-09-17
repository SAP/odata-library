"use strict";

const _ = require("lodash");
const ActionImport = require("./ActionImport");
const AnnotationTarget = require("../annotations/AnnotationTarget");
const EntitySet = require("./EntitySet");
const FunctionImport = require("./FunctionImport");
const Singleton = require("./Singleton");

const childCollections = [
  {
    name: "actionImports",
    sourceElement: "ActionImport",
    Class: ActionImport,
  },
  {
    name: "entitySets",
    sourceElement: "EntitySet",
    Class: EntitySet,
  },
  {
    name: "functionImports",
    sourceElement: "FunctionImport",
    Class: FunctionImport,
  },
  {
    name: "singletons",
    sourceElement: "Singleton",
    Class: Singleton,
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
   * Resolves model path within this entity container.
   *
   * @param {strin} [path] model path
   * @returns {Object} resolved container element
   * @memberof EntityContainer
   */
  resolveModelPath(path) {
    let element;
    if (path) {
      let children = childCollections
        .map((collection) =>
          this[collection.name].find((item) => item.name === path)
        )
        .filter(Boolean);

      if (children.length === 0) {
        throw new Error(`Can't find schema element for path "${path}".`);
      } else if (children.length > 1) {
        throw new Error(
          `Schema error: "${path}" matched ${children.length} schema elememts.`
        );
      }

      element = children[0];
    }

    return element ? element : this;
  }
}

module.exports = EntityContainer;
