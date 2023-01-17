export = ReturnType;
/**
 * ReturnType definition. SRID not implemented.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ReturnType
 *
 * @class ReturnType
 * @extends {AnnotationTarget}
 */
declare class ReturnType extends AnnotationTarget {
    /**
     * Creates an instance of return type.
     * @param {Object} rawMetadata raw metadata object for a return type
     * @memberof ReturnType
     */
    constructor(rawMetadata: any);
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @memberof ReturnType
     */
    initSchemaDependentProperties(schema: CsdlSchema): void;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=ReturnType.d.ts.map