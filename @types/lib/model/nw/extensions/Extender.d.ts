export = Extender;
/**
 * Envelope for vendor specific extensions.
 *
 * SAP extensions implemented
 *
 * https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0
 * https://github.com/SAP/odata-vocabularies
 *
 * @class Extender
 */
declare class Extender {
    /**
     * Applies available extensions to given schema.
     *
     * @static
     * @param {CsdlSchema} [schema] schema for extension
     * @param {Object} [settings] sparsing settings
     * @memberof Extender
     */
    static apply(schema?: CsdlSchema, settings?: any): void;
}
//# sourceMappingURL=Extender.d.ts.map