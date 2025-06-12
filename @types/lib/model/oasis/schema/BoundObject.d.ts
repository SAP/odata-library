export = BoundObject;
/**
 * BoundObject - the class which implements common methods and properties
 * for Actions and Functions.
 *
 * @see https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ActionandFunction
 *
 * @class BoundObject
 * @extends {AnnotationTarget}
 */
declare class BoundObject extends AnnotationTarget {
    /**
     * It is base class for Action and Function. The constuctor is
     * called from the derived classes.
     *
     * @param {Object} rawMetadata raw metadata object for an action
     * @memberof BoundObject
     */
    constructor(rawMetadata: any);
    /**
     * Checks properties consistency, i.e. mandatory properties, return type.
     *
     * @memberof BoundObject
     */
    _checkConsistency(): void;
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @returns {BoundObject} this to allow methods chaining
     * @memberof BoundObject
     */
    initSchemaDependentProperties(schema: CsdlSchema): BoundObject;
    /**
     * Resolves model path within this type.
     *
     * @returns {Object} itself
     * @memberof Function
     */
    resolveModelPath(): any;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=BoundObject.d.ts.map