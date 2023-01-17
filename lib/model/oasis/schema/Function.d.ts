export = Function;
/**
 * Function - service-defined operation.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Function
 *
 * @class Function
 * @extends {AnnotationTarget}
 */
declare class Function extends AnnotationTarget {
    /**
     * Creates an instance of Function
     * @param {Object} rawMetadata raw metadata object for a function
     * @memberof Function
     */
    constructor(rawMetadata: any);
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @returns {Function} this to allow methods chaining
     * @memberof Function
     */
    initSchemaDependentProperties(schema: CsdlSchema): globalThis.Function;
    /**
     * Resolves model path within this type.
     *
     * @returns {Object} itself
     * @memberof Function
     */
    resolveModelPath(): any;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=Function.d.ts.map