export = Action;
/**
 * Action - service-defined operation.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Action
 *
 * @class Action
 * @extends {AnnotationTarget}
 */
declare class Action extends AnnotationTarget {
    /**
     * Creates an instance of Action
     * @param {Object} rawMetadata raw metadata object for an action
     * @memberof Action
     */
    constructor(rawMetadata: any);
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @returns {Action} this to allow methods chaining
     * @memberof Action
     */
    initSchemaDependentProperties(schema: CsdlSchema): Action;
    /**
     * Checks properties consistency, i.e. mandatory properties, return type.
     *
     * @memberof Action
     */
    _checkConsistency(): void;
    /**
     * Resolves model path within this type.
     *
     * @returns {Object} itself
     * @memberof Function
     */
    resolveModelPath(): any;
}
declare namespace Action {
    const DEFAULT_ENTITY_SET_PATH: string;
    const COLLECTION_TYPE_REGEXP: RegExp;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=Action.d.ts.map