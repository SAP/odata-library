export = ComplexType;
/**
 * Envelops a complex type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ComplexType
 *
 * @class ComplexType
 * @extends {AnnotationTarget}
 */
declare class ComplexType extends AnnotationTarget {
    /**
     * Creates an instance of ComplexType.
     * @param {Object} rawMetadata raw metadata object for complex type
     * @memberof ComplexType
     */
    constructor(rawMetadata: any);
    navigationProperties: any;
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @returns {ComplexType} this to allow methods chaining
     * @memberof EntityContainer
     */
    initSchemaDependentProperties(schema: CsdlSchema): ComplexType;
    /**
     * Gets property by its name.
     *
     * @param {string} [name] property name
     * @param {bool} [strict] throw error if not found
     * @returns {Object} property with given name
     * @memberof ComplexType
     * @throws {Error} when property is not found
     */
    getProperty(name?: string, strict?: bool): any;
    /**
     * Gets navigation property by its name.
     *
     * @param {string} [name] navigation property name
     * @param {bool} [strict] throw error if not found
     * @returns {Object} navigation property with given name
     * @memberof EntityType
     * @throws {Error} when navigation property is not found
     */
    getNavigationProperty(name?: string, strict?: bool): any;
    /**
     * Resolves model path within this type.
     *
     * @param {string} [path] model path
     * @returns {Object} model element
     * @memberof EntityType
     */
    resolveModelPath(path?: string): any;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=ComplexType.d.ts.map