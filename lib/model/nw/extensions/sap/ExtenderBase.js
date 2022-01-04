"use strict";

const _ = require("lodash");

/**
 * Helper for vendor specific extensions.
 *
 * https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0
 * https://github.com/SAP/odata-vocabularies
 *
 * @class ExtenderBase
 */
class ExtenderBase {
  static get ATTRIBUTES_SCHEMA() {
    return [["schema-version", (value) => (value ? value : "0000")]];
  }

  /**
   * Creates and applies sap extension for schema element. It contains defined attributes.
   *
   * @static
   * @param {Object} item schema element to be extended, should contain .raw.$ object
   * @param {[Array]} attributes array of arrays defining attributes by name (kebap case) in first element and optional format function in second element
   * @memberof ExtenderBase
   */
  static applyAttributeExtension(item, attributes) {
    ExtenderBase.applyExtension(
      item,
      ExtenderBase.createAttributeExtension(item, attributes)
    );
  }

  /**
   * Applies extension object to schema element.
   *
   * @static
   * @param {Object} item schema element to be extended
   * @param {Object} extension extension object
   * @memberof ExtenderBase
   */
  static applyExtension(item, extension) {
    item.extensions.push(extension);
    Object.defineProperty(item, "sap", {
      get: () => extension,
    });
  }

  /**
   * Creates sap extension for accessing attribute values.
   *
   * @param {Object} [source] object with .raw.$ object
   * @param {[Array]} [attributes] array of arrays defining attributes by name (kebap case) in first element and optional format function in second element
   * @returns {Object} extension object
   */
  static createAttributeExtension(source, attributes) {
    let extension = {};
    attributes.forEach((attribute) => {
      let rawValue = source.raw.$
        ? source.raw.$[`sap:${attribute[0]}`]
        : undefined;
      let value = attribute[1] ? attribute[1](rawValue) : rawValue;
      Object.defineProperty(extension, _.camelCase(attribute[0]), {
        get: () => value,
      });
    });

    extension.extendLegacyApiObject = (api) => {
      attributes.forEach((attribute) => {
        let internalName = _.camelCase(attribute[0]);
        let apiName = _.upperFirst(internalName);
        api[apiName] = extension[internalName];
      });
    };

    return extension;
  }

  static defaultFalseBool(value) {
    return value === "true";
  }

  static defaultTrueBool(value) {
    return value !== "false";
  }
}

module.exports = ExtenderBase;
