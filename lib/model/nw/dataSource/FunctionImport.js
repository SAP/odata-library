"use strict";

const FunctionImportParameter = require("./FunctionImportParameter");

function defineProperty(element, prop, value) {
  Object.defineProperty(element, prop, {
    get: () => value,
  });
}

function initProperties(functionImport, schema) {
  let entitySet = functionImport.raw.$.EntitySet
    ? schema.getEntityContainer().getEntitySet(functionImport.raw.$.EntitySet)
    : undefined;

  defineProperty(
    functionImport,
    "httpMethod",
    functionImport.raw.$["m:HttpMethod"] || "GET"
  );

  // ReturnType is not mandatory in MC-CSLD, but current sap implementation (segw) requires return type now
  defineProperty(
    functionImport,
    "returnType",
    schema.getType(functionImport.raw.$.ReturnType)
  );
  defineProperty(functionImport, "entitySet", entitySet);
  defineProperty(
    functionImport,
    "parameters",
    (functionImport.raw.Parameter || []).map(
      (p) => new FunctionImportParameter(p, schema)
    )
  );
}

/**
 * Envelops an function import.
 *
 * There are substantial differences between MC-CSLD and OASIS-CSDL function imports.
 * SAP implementation follows MS-CSDL.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/d867e86a-6905-4d05-9145-d677b11f8c39
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_FunctionImport
 *
 * @class FunctionImport
 */
class FunctionImport {
  /**
   * Creates an instance of FunctionImport.
   * @param {Object} rawMetadata raw metadata object for the function import
   * @param {CsdlSchema} schema to resolve association reference
   * @memberof FunctionImport
   */
  constructor(rawMetadata, schema) {
    defineProperty(this, "raw", rawMetadata);
    defineProperty(this, "name", rawMetadata.$.Name);
    let extensions = [];
    defineProperty(this, "extensions", extensions);
    initProperties(this, schema);
  }

  /**
   * Gets parameter by its name.
   *
   * @param {String} [name] parameter name
   * @returns {FunctionImportParameter} function import parameter
   * @memberof FunctionImport
   */
  getParameter(name) {
    let param = this.parameters.find((p) => p.name === name);
    if (!param) {
      throw new Error(
        `Parameter ${name} not found for function import ${this.name}`
      );
    }

    return param;
  }

  /**
   * Gets legacy api object. (XML casing, maybe some other changes.)
   *
   * @returns {Object} legacy api object
   * @memberof FunctionImport
   */
  getLegacyApiObject() {
    return {
      Name: this.name,
      ReturnType: this.returnType.namespaceQualifiedName,
      HttpMethod: this.httpMethod,
      Parameter: this.parameters.map((p) => p.getLegacyApiObject()),
    };
  }
}

module.exports = FunctionImport;
