export = Annotation;
/**
 * Envelops an annotation. (OASIS-CSDL)
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Annotation
 *
 * MC-CSDL has different concept (TypeAnnotation and ValueAnnotation)
 * see https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/9fb2fa3c-5aac-4430-87c6-6786314b1588
 *
 * @class Annotation
 */
declare class Annotation {
    /**
     * Creates an instance of Annotation.
     * @param {Object} rawMetadata raw metadata object for the annotation
     * @param {Object} expressionBuilder expression builder for creating value objects
     * @memberof Annotation
     */
    constructor(rawMetadata: any, expressionBuilder: any);
}
//# sourceMappingURL=Annotation.d.ts.map