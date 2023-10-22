"use strict";

const _ = require("lodash");
const NwCsdlSchema = require("./nw/CsdlSchema");
const OasisCsdlSchema = require("./oasis/CsdlSchema");

function getNamespace(path) {
  let matches = /^([a-z0-9_\.]+)\..+/i.exec(path);
  return matches ? matches[1] : undefined;
}

/**
 * Entity Data Model for Data Services
 *
 * Implementation of packaging format for service metadata. Due to OData implementation evolution in sap,
 * there are 2 supported versions of EDMX: 4.0 and 1.0. These "version" specifies which standard is used
 * for EDMX and for CSDL (MS vs OASIS).
 *
 * Version 4.0:
 *  - is used for OData v4 (RAP) metadata and annotations
 *  - is used for OData v2 annotations (RAP and SAP Gateway Service Implementation)
 *  - implements OASIS specification 4.0
 *
 * Version 1.0:
 *  - is used for OData v2 service metadata (RAP and SAP Gateway Service Implementation)
 *  - mix of OASIS and MC specifications: it uses MC for almost everything, OASIS is used for Annotations elements
 *    and Include elements in references (MC-EDMX doesn't allow this type of reference)
 *
 * Specs here:
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-edmx/5dff5e25-56a1-408b-9d44-bff6634c7d16
 * http://docs.oasis-open.org/odata/ns/edmx
 *
 * @class EdmxModel
 */
class EdmxModel {
  /**
   * Creates an instance of EdmxModel.
   * @param {Object} rawMetadata raw metadata object (JSON format from xml2js)
   * @param {Object} [settings] settings for the metadata
   * @memberof EdmxModel
   */
  constructor(rawMetadata, settings) {
    let version = rawMetadata["edmx:Edmx"].$.Version;
    let CsdlSchema = EdmxModel.getSchemaTypeByVersion(version);
    let service = EdmxModel.getService(rawMetadata);
    let schemas = _.isArray(service.Schema)
      ? service.Schema.map((s) => new CsdlSchema(s, settings, this))
      : [];

    // MC-EDMX allows 0, but OASIS-EDMX not
    if (schemas.length === 0) {
      throw new Error("Invalid metadata, no Schema available");
    }

    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    Object.defineProperty(this, "version", {
      get: () => version,
    });

    Object.defineProperty(this, "schemas", {
      get: () => schemas,
    });
  }

  /**
   * Get services in the model.
   *
   * @static
   * @param {Object} rawMetadata raw metadata object (JSON format from xml2js)
   * @returns {Object} edmx data service
   * @memberof EdmxModel
   */
  static getService(rawMetadata) {
    let services = rawMetadata["edmx:Edmx"]["edmx:DataServices"];

    if (services.length !== 1) {
      throw new Error(
        `The edmx:Edmx element specifies exactly one edmx:DataServices subelement, but it has ${services.length} of them.`
      );
    }

    return services[0];
  }

  /**
   * Get CSDL schema implementation by Edmx version.
   * '1.0': mix of MC and OASIS standards
   * '4.0': OASIS standard
   *
   * @static
   * @private
   * @param {string} version Edmx version
   * @returns {Object} CsdlSchema implementation
   * @memberof EdmxModel
   */
  static getSchemaTypeByVersion(version) {
    let CsdlSchema = {
      "1.0": NwCsdlSchema,
      "4.0": OasisCsdlSchema,
    }[version];

    if (!CsdlSchema) {
      throw new Error(`Edmx version '${version}' is not supported.`);
    }

    return CsdlSchema;
  }

  /**
   * Gets default DataService Schema from metadata object.
   *
   * @param {String} [namespace] is used to specify service namespace
   *
   * @returns {object} default Schema from metadata object.
   *
   * @memberof EdmxModel
   */
  getSchema(namespace) {
    // OASIS-EDMX: A schema is identified by a namespace. Schema namespaces MUST be unique within the scope of a document,
    // and SHOULD be globally unique. A schema cannot span more than one document.
    // MC-EDMX: A schema definition can span across more than one CSDL document. ...
    // So the more restrictive applies.
    return this.schemas.find((s) => !namespace || s.namespace === namespace);
  }

  /**
   * Very simple merge of edmx models. The only supported use case is that the another model just contains annotations
   * for the first model (OASIS-EDMX style back reference).
   *
   * More correct approach would be mo merge by Edmx namespace references relations. But currently there
   * is no benefit from supporting more scenarios.
   *
   * @param {Object} anotherModel another edmx model with just annotations in default schema
   * @returns {object} this to allow method chaining.
   */
  merge(anotherModel) {
    this.getSchema().applyAnnotations(anotherModel.getSchema().raw.Annotations);
    return this;
  }

  /**
   * Applies vendor schema extensions.
   *
   * @param {Object} [settings] parsing settings
   * @memberof EdmxModel
   */
  applySchemaExtensions(settings) {
    this.schemas.map((s) => s.applyExtensions(settings));
  }

  /**
   * Resolves model path expression.
   *
   * A model path is used within Annotation Path, Model Element Path, Navigation Property Path,
   * and Property Path expressions to traverse the model of a service and resolves to the model
   * element identified by the path
   *
   * Implemented only needed scope (OASIS-CSDL) and associations (MC-CSDL) (https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/77d7ccbb-bda8-444a-a160-f4581172322f).
   *
   * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Target
   * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_PathExpressions
   *
   * @param {string} path model path expression
   * @returns {Object} schema element
   * @memberof EdmxModel
   */
  resolveModelPath(path) {
    let namespace = getNamespace(path);
    let schema = this.getSchema(namespace);
    if (!schema) {
      throw new Error(`Can't find schema for '${path}' model path.`);
    }

    return schema.resolveModelPath(path);
  }
}

module.exports = EdmxModel;
