export = NavigationProperty;
/**
 * Envelops a navigation property.
 *
 * There are big differences OASIS-CSDL and MC-CSDL navigation properties. SAP follows MC-CSDL in this.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/e83d21c4-7f0a-4cc7-ac38-f2fbe15d3398
 * (http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_NavigationProperty)
 *
 * @class NavigationProperty
 * @extends {AnnotationTarget}
 */
declare class NavigationProperty extends AnnotationTarget {
    /**
     * Creates an instance of NavigationProperty.
     * @param {Object} rawMetadata raw metadata object for navigation property
     * @memberof NavigationProperty
     */
    constructor(...args: any[]);
    /**
     * Gets navigation property target information.
     *
     * @param {CsdlSchema} schema to resolve model paths
     * @returns {Object} navigation property target
     * @memberof NavigationProperty
     */
    getTarget(schema: CsdlSchema): any;
}
import AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");
//# sourceMappingURL=NavigationProperty.d.ts.map