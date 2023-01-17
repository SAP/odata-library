export = Parameter;
/**
 * Parameter definition. SRID not implemented.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Parameter
 *
 * @class Parameter
 * @extends {AnnotationTarget}
 */
declare class Parameter extends AnnotationTarget {
    /**
     * Creates an instance of Parameter.
     * @param {Object} rawMetadata raw metadata object for a return type
     * @memberof Parameter
     */
    constructor(rawMetadata: any);
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @memberof Parameter
     */
    initSchemaDependentProperties(schema: CsdlSchema): void;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=Parameter.d.ts.map