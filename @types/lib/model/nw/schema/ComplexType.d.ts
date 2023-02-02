export = ComplexType;
/**
 * Envelops a complex type.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/ceb3ffc2-812c-4cd9-98e8-184deffa9b09
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ComplexType
 *
 * @class ComplexType
 * @extends {AnnotationTarget}
 */
declare class ComplexType extends AnnotationTarget {
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
     * @returns {Object} property with given name or undefined, if property doesn't exist
     * @memberof ComplexType
     */
    getProperty(name?: string, strict?: bool): any;
    /**
     * Resolves model path within this type.
     *
     * @param {string} [path] model path
     * @returns {Object} resolved element
     * @memberof ComplexType
     */
    resolveModelPath(path?: string): any;
}
import AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");
//# sourceMappingURL=ComplexType.d.ts.map