"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");
const Parameter = require("./Parameter");
const ReturnType = require("./ReturnType");

/**
 * BoundObject - the class which implements common methods and properties
 * for Actions and Functions.
 *
 * @see https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ActionandFunction
 *
 * @class BoundObject
 * @extends {AnnotationTarget}
 */
class BoundObject extends AnnotationTarget {
  /**
   * It is base class for Action and Function. The constuctor is
   * called from the derived classes.
   *
   * @param {Object} rawMetadata raw metadata object for an action
   * @memberof BoundObject
   */
  constructor(rawMetadata) {
    super(rawMetadata);

    if (_.isArray(rawMetadata.ReturnType)) {
      let returnType = new ReturnType(rawMetadata.ReturnType[0]);
      Object.defineProperty(this, "returnType", {
        get: () => returnType,
      });
    }

    let parameters = _.map(rawMetadata.Parameter, (md) => new Parameter(md));

    Object.defineProperty(this, "parameters", {
      get: () => parameters,
    });

    Object.defineProperty(this, "isBound", {
      get: () => rawMetadata.$.IsBound === "true",
    });

    Object.defineProperty(this, "entitySetPath", {
      get: () => rawMetadata.$.EntitySetPath,
    });

    this._checkConsistency();
  }

  /**
   * Checks properties consistency, i.e. mandatory properties, return type.
   *
   * @memberof BoundObject
   */
  _checkConsistency() {
    if (!this.name) {
      throw new Error("Name attribute is mandatory for action.");
    }
  }

  /**
   * Initializes schema dependent properties. Decoupled from constructor,
   * because it needs to resolve schema (type) references.
   *
   * @param {CsdlSchema} schema to resolve references
   * @returns {BoundObject} this to allow methods chaining
   * @memberof BoundObject
   */
  initSchemaDependentProperties(schema) {
    if (_.has(this, "returnType")) {
      this.returnType.initSchemaDependentProperties(schema);
    }

    this.parameters.forEach((p) => p.initSchemaDependentProperties(schema));

    if (this.isBound) {
      const boundType = this.parameters[0].type;
      Object.defineProperty(this, "boundType", {
        get: () => boundType,
      });
    }

    Object.defineProperty(this, "schema", {
      get: () => schema,
    });

    return this;
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

module.exports = BoundObject;
