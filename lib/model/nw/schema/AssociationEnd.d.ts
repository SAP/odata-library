export = AssociationEnd;
/**
 * Envelops an association end.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/f5fec50d-2930-4265-945d-965cd4db8153
 * (not present in OASIS-CSDL)
 *
 * @class AssociationEnd
 */
declare class AssociationEnd {
    /**
     * Creates an instance of AssociationEnd.
     * @param {Object} rawMetadata raw metadata object for the association end
     * @memberof AssociationEnd
     */
    constructor(rawMetadata: any);
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @memberof AssociationEnd
     */
    initSchemaDependentProperties(schema: CsdlSchema): void;
}
//# sourceMappingURL=AssociationEnd.d.ts.map