export = Property;
/**
 * Envelops a (structural) property.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/50129087-bb7f-475e-a14d-7a8a4bdef966
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_StructuralProperty
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
import AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");
//# sourceMappingURL=Property.d.ts.map