export = TypeDefinition;
/**
 * Envelops a type definition, i.e. primitive type specialization. SRID not implemented.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_TypeDefinition
 *
 * @class TypeDefinition
 * @extends {AnnotationTarget}
 */
declare class TypeDefinition extends AnnotationTarget {
    /**
     * Creates an instance of TypeDefinition.
     * @param {Object} rawMetadata raw metadata object for type definition
     * @memberof TypeDefinition
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
    _checkConsistency(): void;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=TypeDefinition.d.ts.map