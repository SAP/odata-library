export = EntityType;
/**
 * Envelops an entity type.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/6875ce6c-837c-4cea-8e35-441dc2366008
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntityType
 *
 * @class EntityType
 * @extends {ComplexType}
 */
declare class EntityType extends ComplexType {
    /**
     * Gets navigation property by its name.
     *
     * @param {string} [name] navigation property name
     * @param {bool} [strict] throw error if not found
     * @returns {Object} navigation property with given name or undefined, if property doesn't exist
     * @memberof EntityType
     */
    getNavigationProperty(name?: string, strict?: bool): any;
    /**
     * Gets entity type parameter. (SAP specific, used for implementing parametrized entity sets.)
     *
     * @param {string} [name] parameter name
     * @param {CsdlSchema} [schema] schema for resolving references
     * @returns {Object} parameter or undefined
     * @memberof EntityType
     */
    getParameter(name?: string, schema?: CsdlSchema): any;
    /**
     * Resolves model path within this type.
     *
     * @param {string} [path] model path
     * @param {CsdlSchema} [schema] schema for resolving references
     * @returns {Object} model element
     * @memberof EntityType
     */
    resolveModelPath(path?: string, schema?: CsdlSchema): any;
    /**
     * Creates entity type 'key' property.
     *
     * @returns {Property[]} array of properties that defines entity key
     *
     * @memberof EntityType
     *
     * @private
     */
    private _createKey;
}
import ComplexType = require("./ComplexType");
//# sourceMappingURL=EntityType.d.ts.map