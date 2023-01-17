export = CsdlSchema;
/**
 * Top-level conceptual schema definition language (CSDL) construct that allows creation of a namespace.
 * OASIS
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html
 *
 * @class CsdlSchema
 */
declare class CsdlSchema {
    /**
     * Initialize metadata collections (EntityType, Action,...)
     *
     * @param {CsdlSchema} schema - instance of the schema to append collections
     * @param {EdmxModel} metaModel - instance of metadata model class. The instance
     *        is passed to child instances for cross reference usage like basetype
     *        and entity types from differnet schemas
     */
    static initChildProperties(schema: CsdlSchema, metaModel: EdmxModel): void;
    static initSchemaDependentProperties(schema: any): void;
    static matchPath(regex: any, path: any, name: any): any;
    static parseTypePath(targetPath: any): {
        path: any;
        namespace: any;
        name: any;
        isCollection: boolean;
    };
    static parseModelPath(targetPath: any): {
        path: any;
        namespace: any;
        element: any;
        subElement: any;
    };
    /**
     * Creates an instance of CsdlSchema.
     * @param {Object} rawMetadata raw metadata object for schema
     * @param {Object} [settings] (normalized) settings for the metadata, e.g. { strict: false } to ignore non critical errors
     * @param {EdmxModel} metaModel root point of metadata in-memory structure
     *
     * @memberof CsdlSchema
     */
    constructor(rawMetadata: any, settings?: any, metaModel: EdmxModel);
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
     * Implemented only needed scope.
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