"use strict";

const _ = require("lodash");

function defineProperty(element, prop, value) {
  Object.defineProperty(element, prop, {
    get: () => value,
  });
}

function defineOptionalNumber(element, prop) {
  let value = _.has(element.raw.$, prop)
    ? Number(element.raw.$[prop])
    : undefined;
  defineProperty(element, _.lowerFirst(prop), value);
}

/**
 * Envelops an function import parameter.
 *
 * There are substantial differences between MC-CSLD and OASIS-CSDL. SAP implementation follows MS-CSDL.
 * OASIS-CSDL doesn't have function import parameters, it has action and function parameters (~ model function parameters).
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/2d7f0f3e-1333-4309-8194-a0148a9c946c
 *
 * @class FunctionImportParameter
 */
class FunctionImportParameter {
  /**
   * Creates an instance of FunctionImportParameter.
   * @param {Object} rawMetadata raw metadata object for the function import
   * @param {CsdlSchema} schema to resolve model references
   * @memberof FunctionImportParameter
   */
  constructor(rawMetadata, schema) {
    let mode = rawMetadata.$.Mode;
    defineProperty(this, "raw", rawMetadata);
    defineProperty(this, "name", rawMetadata.$.Name);

    defineProperty(this, "type", schema.getType(rawMetadata.$.Type));
    defineOptionalNumber(this, "MaxLength");
    defineProperty(this, "nullable", rawMetadata.$.Nullable !== "false");
    defineOptionalNumber(this, "Precision");
    defineOptionalNumber(this, "Scale");

    if (!["In", "Out", "InOut"].includes(mode)) {
      if (schema.settings.strict !== false) {
        throw new Error(
          `Unknown mode '${this.mode} for function import parameter '${this.name}`
        );
      } else {
        mode = "In";
      }
    }

    defineProperty(this, "mode", mode);

    let extensions = [];
    defineProperty(this, "extensions", extensions);
  }

  /**
   * Gets legacy api object. (XML casing, maybe some other changes.)
   *
   * @returns {Object} legacy api object
   * @memberof FunctionImport
   */
  getLegacyApiObject() {
    return {
      MaxLength: this.maxLength,
      Mode: this.mode,
      Name: this.name,
      Nullable: this.nullable,
      Precision: this.precision,
      Scale: this.scale,
      Type: this.type.namespaceQualifiedName,
    };
  }
}

module.exports = FunctionImportParameter;
