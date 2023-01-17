export = CsdlSchema;
/**
 * Top-level conceptual schema definition language (CSDL) construct that allows creation of a namespace.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/f7d95765-3b64-4c77-b144-9d28862b0403
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html
 *
 * @class CsdlSchema
 */
declare class CsdlSchema {
    /**
     * Creates an instance of CsdlSchema.
     *
     * @param {Object} rawMetadata raw metadata object for schema
     * @param {Object} [settings] (normalized) settings for the metadata, e.g. { strict: false } to ignore non critical errors
     * @param {Object} model reference to model which owns the schema
     *
     * @memberof CsdlSchema
     */
    constructor(rawMetadata: any, settings?: any, model: any);
    /**
     * Gets an EntityType defined in schema
     *
     * @param {string} [name] type name
     * @returns {EntityType} type with given name
     * @memberof CsdlSchema
     */
    getEntityType(name?: string): EntityType;
    /**
     * Gets entity container with given name (or default container).
     *
     * @param {string} [name] (optional) name of the container.
     * @returns {Object} entity container
     */
    getEntityContainer(name?: string): any;
    /**
     * Gets a Type available in schema
     *
     * Enumeration types, collection types and Untyped are not implemented.
     *
     * @param {string} [name] namespace qualified type name
     * @returns {EntityType|ComplexType|SimpleType} type with given name
     * @memberof CsdlSchema
     */
    getType(name?: string): EntityType | ComplexType | SimpleType;
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
     * @memberof CsdlSchema
     */
    resolveModelPath(path: string): any;
    /**
     * Applies annotations to target elements structures.
     *
     * @param {Object[]} annotationsData raw annotaions data
     * @memberof CsdlSchema
     */
    applyAnnotations(annotationsData: any[]): void;
    /**
     * Applies annotation based vendor extensions.
     *
     * @param {Object} [settings] parsing settings
     * @memberof CsdlSchema
     */
    applyExtensions(settings?: any): void;
    /**
     * Creates path structure from model path.
     *
     * @param {string} [path] annotation target model path
     * @returns {Object} structure describing annotation target
     * @memberof CsdlSchema
     * @private
     */
    private _parseModelPath;
    /**
     * Gets type collections for a namespace.
     *
     * @param {string} [namespace] type namespace
     * @returns {Object[]} array of type collections
     * @memberof CsdlSchema
     * @private
     */
    private _getTypeCollections;
    /**
     * Applies annotations to specific path. Error handling is done according to schema settings.
     *
     * @param {Object[]} [annotations] annotations to apply
     * @param {string} [path] target path
     * @memberof CsdlSchema
     * @private
     */
    private _applyAnnotationsToPath;
}
import EntityType = require("./schema/EntityType");
import ComplexType = require("./schema/ComplexType");
//# sourceMappingURL=CsdlSchema.d.ts.map