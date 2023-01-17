export = EdmxModel;
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
declare class EdmxModel {
    /**
     * Get services in the model.
     *
     * @static
     * @param {Object} rawMetadata raw metadata object (JSON format from xml2js)
     * @returns {Object} edmx data service
     * @memberof EdmxModel
     */
    static getService(rawMetadata: any): any;
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
    private static getSchemaTypeByVersion;
    /**
     * Creates an instance of EdmxModel.
     * @param {Object} rawMetadata raw metadata object (JSON format from xml2js)
     * @param {Object} [settings] settings for the metadata
     * @memberof EdmxModel
     */
    constructor(rawMetadata: any, settings?: any);
    /**
     * Gets default DataService Schema from metadata object.
     *
     * @param {String} [namespace] is used to specify service namespace
     *
     * @returns {object} default Schema from metadata object.
     *
     * @memberof EdmxModel
     */
    getSchema(namespace?: string): object;
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
    merge(anotherModel: any): object;
    /**
     * Applies vendor schema extensions.
     *
     * @param {Object} [settings] parsing settings
     * @memberof EdmxModel
     */
    applySchemaExtensions(settings?: any): void;
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
    resolveModelPath(path: string): any;
}
//# sourceMappingURL=EdmxModel.d.ts.map