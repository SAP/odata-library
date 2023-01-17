export = Extender;
/**
 * Envelope for vendor specific extensions.
 *
 * SAP extensions implemented
 *
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
     * @memberof Extender
     */
    static apply(schema?: CsdlSchema): void;
}
//# sourceMappingURL=Extender.d.ts.map