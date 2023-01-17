export = AssociationSetEnd;
/**
 * Envelops an association set end.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/3c3578f7-9de9-4e7b-9a85-2ed690bab9e7
 * (not present in OASIS-CSDL)
 *
 * @class AssociationSetEnd
 */
declare class AssociationSetEnd {
    /**
     * Creates an instance of AssociationEnd.
     * @param {Object} rawMetadata raw metadata object for the association end
     * @param {CsdlSchema} schema to resolve association reference
     * @param {Association} association for which the AssociationSet is being defined.
     * @memberof AssociationSetEnd
     */
    constructor(rawMetadata: any, schema: CsdlSchema, association: Association);
}
//# sourceMappingURL=AssociationSetEnd.d.ts.map