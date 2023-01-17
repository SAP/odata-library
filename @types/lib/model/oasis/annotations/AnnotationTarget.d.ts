export = AnnotationTarget;
/**
 * Envelopes an annotation target:
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Target
 *
 * @class AnnotationTarget
 */
declare class AnnotationTarget {
    /**
     * Creates an instance of AnnotationTarget.
     *
     * @param {Object} rawMetadata raw metadata object for annotation target object
     * @param {Object} model reference to model which owns the annotation target
     *
     * @memberof AnnotationTarget
     */
    constructor(rawMetadata: any, model: any);
    annotations: any[];
    /**
     * Applies external target annoations.
     *
     * see https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/9fb2fa3c-5aac-4430-87c6-6786314b1588
     * see http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_AnnotationswithExternalTargeting
     *
     * @param {Object[]} [annotations] Annotations (container) elements
     */
    applyAnnotations(annotations?: any[]): void;
    /**
     * Checks if annotations contains specific term.
     *
     * @param {string} term annotation term to search for.
     * @returns {boolean} true if term is contained in annotations.
     */
    hasTerm(term: string): boolean;
    /**
     * Gets legacy api object. (XML casing, maybe some other changes.)
     *
     * @returns {Object} legacy api object
     * @memberof AnnotationTarget
     */
    getLegacyApiObject(): any;
}
//# sourceMappingURL=AnnotationTarget.d.ts.map