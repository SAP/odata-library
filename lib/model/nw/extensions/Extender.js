"use strict";

const SapExtenderBase = require("./sap/ExtenderBase");
const SapEntityTypeExtender = require("./sap/EntityTypeExtender");
const SapEntityContainerExtender = require("./sap/EntityContainerExtender");

/**
 * Envelope for vendor specific extensions.
 *
 * SAP extensions implemented
 *
 * https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0
 * https://github.com/SAP/odata-vocabularies
 *
 * @class Extender
 */
class Extender {
  /**
   * Applies available extensions to given schema.
   *
   * @static
   * @param {CsdlSchema} [schema] schema for extension
   * @param {Object} [settings] sparsing settings
   * @memberof Extender
   */
  static apply(schema, settings) {
    SapExtenderBase.applyAttributeExtension(
      schema,
      SapExtenderBase.ATTRIBUTES_SCHEMA
    );
    schema.entityTypes.forEach((et) =>
      SapEntityTypeExtender.process(et, schema, settings)
    );
    schema.entityContainers.forEach(SapEntityContainerExtender.process);
  }
}

module.exports = Extender;
