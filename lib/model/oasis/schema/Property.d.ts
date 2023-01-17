export = Property;
/**
 * Envelops a (structural) property.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_StructuralProperty
 *
 * Geometry or geography property not supported (SRID attribute)
 *
 * @class Property
 * @extends {AnnotationTarget}
 */
declare class Property extends AnnotationTarget {
    /**
     * Creates an instance of Property.
     * @param {Object} rawMetadata raw metadata object for property
     * @memberof Property
     */
    constructor(rawMetadata: any);
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @memberof AssociationEnd
     */
    initSchemaDependentProperties(schema: CsdlSchema): void;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=Property.d.ts.map