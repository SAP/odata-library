"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");
const Parameter = require("./Parameter");
const ReturnType = require("./ReturnType");

/**
 * Action - service-defined operation.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Action
 *
 * @class Action
 * @extends {AnnotationTarget}
 */
class Action extends AnnotationTarget {
  /**
   * Creates an instance of Action
   * @param {Object} rawMetadata raw metadata object for an action
   * @memberof Action
   */
  constructor(rawMetadata) {
    super(rawMetadata);
    if (_.isArray(rawMetadata.ReturnType)) {
      let returnType = new ReturnType(rawMetadata.ReturnType[0]);
      Object.defineProperty(this, "returnType", {
        get: () => returnType,
      });
    }

    let parameters = (rawMetadata.Parameter || []).map(
      (md) => new Parameter(md)
    );
    Object.defineProperty(this, "parameters", {
      get: () => parameters,
    });

    Object.defineProperty(this, "isBound", {
      get: () => rawMetadata.$.IsBound === "true",
    });

    Object.defineProperty(this, "entitySetPath", {
      get: () => rawMetadata.$.EntitySetPath,
    });

    Object.defineProperty(this, "entityTypePath", {
      get: () => {
        const entitySetPath = _.has(rawMetadata, "$.EntitySetPath")
          ? rawMetadata.$.EntitySetPath
          : Action.DEFAULT_ENTITY_SET_PATH;
        let parameterWithType = _.filter(
          rawMetadata.Parameter,
          (parameter) => parameter.$.Name === entitySetPath
        );
        return _.get(parameterWithType, "0.$.Type");
      },
    });

    Object.defineProperty(this, "entityType", {
      get: () => {
        let matchCollection;
        let entityType = this.entityTypePath;
        if (_.isString(entityType)) {
          matchCollection = entityType.match(Action.COLLECTION_TYPE_REGEXP);
        }
        return matchCollection ? matchCollection[1] : entityType;
      },
    });

    this._checkConsistency();
  }

  /**
   * Initializes schema dependent properties. Decoupled from constructor,
   * because it needs to resolve schema (type) references.
   *
   * @param {CsdlSchema} schema to resolve references
   * @returns {Action} this to allow methods chaining
   * @memberof Action
   */
  initSchemaDependentProperties(schema) {
    if (_.has(this, "returnType")) {
      this.returnType.initSchemaDependentProperties(schema);
    }

    this.parameters.forEach((p) => p.initSchemaDependentProperties(schema));
    return this;
  }

  /**
   * Checks properties consistency, i.e. mandatory properties, return type.
   *
   * @memberof Action
   */
  _checkConsistency() {
    if (!this.name) {
      throw new Error("Name attribute is mandatory for action.");
    }

    if (_.isArray(this.raw.ReturnType) && this.raw.ReturnType.length !== 1) {
      throw new Error(
        `Function ${this.name} may contain at most one ReturnType element`
      );
    }
  }

  /**
   * Resolves model path within this type.
   *
   * @returns {Object} itself
   * @memberof Function
   */
  resolveModelPath() {
    return this;
  }
}

Action.DEFAULT_ENTITY_SET_PATH = "_it";
Action.COLLECTION_TYPE_REGEXP = /^Collection\(([^)]+)\)$/;

module.exports = Action;
