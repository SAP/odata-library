export = NavigationProperty;
/**
 * Envelops a navigation property.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_NavigationProperty
 *
 *
 * @class NavigationProperty
 * @extends {AnnotationTarget}
 */
declare class NavigationProperty extends AnnotationTarget {
    /**
     * Creates an instance of NavigationProperty.
     * @param {Object} rawMetadata raw metadata object for NavigationProperty
     * @memberof NavigationProperty
     */
    constructor(rawMetadata: any);
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @memberof NavigationProperty
     */
    initSchemaDependentProperties(schema: CsdlSchema): void;
    /**
     * Gets navigation property target information.
     *
     * @param {CsdlSchema} schema to resolve model paths
     * @param {EntitySet|Singleton} source model of the source set/singleton
     * @returns {Object} navigation property target
     * @memberof NavigationProperty
     */
    getTarget(schema: CsdlSchema, source: EntitySet | Singleton): any;
    _processOnDelete(rawMetadata: any): void;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=NavigationProperty.d.ts.map