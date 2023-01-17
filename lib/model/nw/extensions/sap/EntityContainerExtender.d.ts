export = EntityContainerExtender;
/**
 * Envelope for sap vendor specific extensions for entity container.
 *
 * https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0
 * https://github.com/SAP/odata-vocabularies
 *
 * @class EntityContainerExtender
 */
declare class EntityContainerExtender {
    /**
     * Process extension for entity type and child elements.
     *
     * @static
     * @param {Object} entityContainer schema element to be processed
     * @memberof EntityContainerExtender
     */
    static process(entityContainer: any): void;
}
//# sourceMappingURL=EntityContainerExtender.d.ts.map