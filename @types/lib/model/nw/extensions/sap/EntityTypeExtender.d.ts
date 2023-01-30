export = EntityTypeExtender;
/**
 * Envelope for sap vendor specific extensions for entity types.
 *
 * https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0
 * https://github.com/SAP/odata-vocabularies
 *
 * @class EntityTypeExtender
 */
declare class EntityTypeExtender {
    /**
     * Process extension for entity type and child elements.
     *
     * @static
     * @param {Object} entityType schema element to be processed
     * @param {CsdlSchema} [schema] schema for extension
     * @param {Object} [settings] sparsing settings
     * @memberof EntityTypeExtender
     */
    static process(entityType: any, schema?: CsdlSchema, settings?: any): void;
}
declare namespace EntityTypeExtender {
    namespace _ {
        export { createEntityTypeCommonExtension };
    }
}
declare function createEntityTypeCommonExtension(entityType: any, schema: any, settings: any): {
    sideEffects: any;
};
//# sourceMappingURL=EntityTypeExtender.d.ts.map