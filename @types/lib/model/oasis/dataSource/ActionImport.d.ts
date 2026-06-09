export = ActionImport;
/**
 * Envelops an action import.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ActionImport
 *
 * @class ActionImport
 * @extends {AnnotationTarget}
 */
declare class ActionImport extends AnnotationTarget {
    /**
     * Creates an instance of ActionImport.
     * @param {Object} rawMetadata raw metadata object for the action import
     * @param {CsdlSchema} schema to resolve action reference
     * @memberof ActionImport
     */
    constructor(rawMetadata: Object, schema: CsdlSchema);
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=ActionImport.d.ts.map