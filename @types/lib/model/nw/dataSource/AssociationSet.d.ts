export = AssociationSet;
/**
 * Envelops an association set.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/84fdfd02-7b12-4aa3-a2eb-51bab109f439
 * (not present in OASIS-CSDL)
 *
 * @class AssociationSet
 */
declare class AssociationSet {
    /**
     * Creates an instance of AssociationSet.
     * @param {Object} rawMetadata raw metadata object for the association set
     * @param {CsdlSchema} schema to resolve association reference
     * @memberof Association
     */
    constructor(rawMetadata: any, schema: CsdlSchema);
    getEndByRole(role: any): any;
}
//# sourceMappingURL=AssociationSet.d.ts.map