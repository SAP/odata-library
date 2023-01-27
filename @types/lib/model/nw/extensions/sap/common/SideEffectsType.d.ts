export = SideEffectsType;
/**
 * Envelopes Side Effects type
 *
 * https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/Common.md#SideEffectsType
 *
 * @class SideEffectsType
 */
declare class SideEffectsType {
    /**
     * Creates an instance of SideEffectsType.
     * @param {Annotation} [annotation] side effects
     * @param {EntityType} [entityType] target entity type
     * @param {CsdlSchema} [schema] parent schema
     * @param {Object} [settings] settings for the metadata
     * @memberof SideEffectsType
     */
    constructor(annotation?: Annotation, entityType?: EntityType, schema?: CsdlSchema, settings?: any);
}
declare namespace SideEffectsType {
    namespace _ {
        export { definePropertyCollection };
    }
}
declare function definePropertyCollection(owner: any, property: any, transformer: any): void;
//# sourceMappingURL=SideEffectsType.d.ts.map