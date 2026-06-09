export = FunctionImport;
/**
 * Envelops an action import.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_FunctionImport
 *
 * @class FunctionImport
 * @extends {AnnotationTarget}
 */
declare class FunctionImport extends AnnotationTarget {
    /**
     * Creates an instance of FunctionImport.
     * @param {Object} rawMetadata raw metadata object for the function import
     * @param {CsdlSchema} schema to resolve function reference
     * @memberof FunctionImport
     */
    constructor(rawMetadata: Object, schema: CsdlSchema);
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=FunctionImport.d.ts.map