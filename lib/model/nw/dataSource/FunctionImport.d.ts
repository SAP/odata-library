export = FunctionImport;
/**
 * Envelops an function import.
 *
 * There are substantial differences between MC-CSLD and OASIS-CSDL function imports.
 * SAP implementation follows MS-CSDL.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/d867e86a-6905-4d05-9145-d677b11f8c39
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_FunctionImport
 *
 * @class FunctionImport
 */
declare class FunctionImport {
    /**
     * Creates an instance of FunctionImport.
     * @param {Object} rawMetadata raw metadata object for the function import
     * @param {CsdlSchema} schema to resolve association reference
     * @memberof FunctionImport
     */
    constructor(rawMetadata: any, schema: CsdlSchema);
    /**
     * Gets parameter by its name.
     *
     * @param {String} [name] parameter name
     * @returns {FunctionImportParameter} function import parameter
     * @memberof FunctionImport
     */
    getParameter(name?: string): FunctionImportParameter;
    /**
     * Gets legacy api object. (XML casing, maybe some other changes.)
     *
     * @returns {Object} legacy api object
     * @memberof FunctionImport
     */
    getLegacyApiObject(): any;
}
import FunctionImportParameter = require("./FunctionImportParameter");
//# sourceMappingURL=FunctionImport.d.ts.map