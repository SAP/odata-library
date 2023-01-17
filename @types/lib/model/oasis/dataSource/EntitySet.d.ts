export = EntitySet;
/**
 * Envelops an entity set.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntitySet
 *
 * @class EntitySet
 * @extends {AnnotationTarget}
 */
declare class EntitySet extends AnnotationTarget {
    /**
     * Gets info on parameterization of the entity set
     *
     * @returns {Object} info with {Bool} isParameterized and {NavigationProperty} valuesAssociation, if isParameterized is true
     * @memberof EntitySet
     */
    getParameterizationInfo(): any;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=EntitySet.d.ts.map