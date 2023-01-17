export = EnumType;
/**
 * Envelops an enumeration type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EnumerationType
 *
 * @class EnumType
 * @extends {AnnotationTarget}
 */
declare class EnumType extends AnnotationTarget {
    /**
     * Creates an instance of EnumType.
     * @param {Object} rawMetadata raw metadata object for enum type
     * @memberof EnumType
     */
    constructor(rawMetadata: any);
    _checkConsistency(): void;
    _checkMembers(): void;
}
import AnnotationTarget = require("../annotations/AnnotationTarget");
//# sourceMappingURL=EnumType.d.ts.map