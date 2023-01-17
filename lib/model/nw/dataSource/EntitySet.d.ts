export = EntitySet;
/**
 * Envelops an entity set.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/4a09a48c-1da3-4d84-87b4-2b6c46731470
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntitySet
 *
 * @class EntitySet
 * @extends {AnnotationTarget}
 */
declare class EntitySet extends AnnotationTarget {
    /**
     * Gets info on parameterization of the entity set
     *
     * @param {CsdlSchema} schema to resolve association reference
     * @returns {Object} info with {Bool} isParameterized and {NavigationProperty} valuesAssociation, if isParameterized is true
     * @memberof EntitySet
     */
    getParameterizationInfo(schema: CsdlSchema): any;
}
import AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");
//# sourceMappingURL=EntitySet.d.ts.map