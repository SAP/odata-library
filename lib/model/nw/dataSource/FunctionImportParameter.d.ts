export = FunctionImportParameter;
/**
 * Envelops an function import parameter.
 *
 * There are substantial differences between MC-CSLD and OASIS-CSDL. SAP implementation follows MS-CSDL.
 * OASIS-CSDL doesn't have function import parameters, it has action and function parameters (~ model function parameters).
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/2d7f0f3e-1333-4309-8194-a0148a9c946c
 *
 * @class FunctionImportParameter
 */
declare class FunctionImportParameter {
    /**
     * Creates an instance of FunctionImportParameter.
     * @param {Object} rawMetadata raw metadata object for the function import
     * @param {CsdlSchema} schema to resolve model references
     * @memberof FunctionImportParameter
     */
    constructor(rawMetadata: any, schema: CsdlSchema);
    /**
     * Gets legacy api object. (XML casing, maybe some other changes.)
     *
     * @returns {Object} legacy api object
     * @memberof FunctionImport
     */
    getLegacyApiObject(): any;
}
//# sourceMappingURL=FunctionImportParameter.d.ts.map