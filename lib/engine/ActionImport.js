"use strict";

/**
 * Javascript class which implements Action Import funcionality
 *
 * @class ActionImport
 */
class ActionImport {
  /**
   * Creates ActionImport instance from schema and Action
   *
   * @static
   * @param {CsdlSchema} schema service schema
   * @param {Action} action action of the action import
   * @return {ActionImport} action import instance, if it can be found
   * @memberof ActionImport
   */
  static fromSchemaAndAction(schema, action) {
    const importMeta = schema
      .getEntityContainer()
      .actionImports.find((a) => a.action.name === action.meta.name);
    return importMeta ? new ActionImport(action, importMeta) : undefined;
  }

  /**
   * Creates an instance of <code>ActionImport</code>.
   * @param {Action} action instance of the Action class
   * @param {Object} metadata information about ActionImport from Metadata
   * @memberof ActionImport
   */
  constructor(action, metadata) {
    Object.defineProperty(this, "action", {
      value: action,
      writable: false,
    });

    Object.defineProperty(this, "meta", {
      value: metadata,
      writable: false,
    });
  }

  /**
   * Create function which directly call's action import without
   * additional selection of the \"call\" method.
   *
   * @return {Function} function which directly send request to the
   *                    Action
   *
   * @memberof ActionImport
   */
  createDirectCaller() {
    return this.action.createDirectCaller(undefined, this.meta);
  }
}

module.exports = ActionImport;
