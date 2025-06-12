export = FunctionImport;
/**
 * Javascript class which implements FunctionImport funcionality
 *
 * @class FunctionImport
 * @extends {Resource}
 */
declare class FunctionImport extends Resource {
    /**
     * Creates an instance of <code>FunctionImport</code>.
     * @param {Agent} agent instance of the Agent class @see Agent.js
     * @param {Object} functionImportProperties information about FunctionImport from Metadata
     * @memberof FunctionImport
     */
    constructor(agent: Agent, functionImportProperties: any);
    /**
     * Create function which directly call's function import without
     * additional selection of the \"call\" method.
     *
     * @private
     *
     * @return {Function} function which directly send request to the
     *                    FunctionImport
     *
     * @memberof FunctionImport
     */
    private createDirectCaller;
    /**
     * Call post/get method (base on the metadata) to create FunctionImport
     * request
     *
     * @public
     *
     * @param {Object} [parameters] is object which contains key/values definiton
     *        of parameter names and values (see service metadata for parameter
     *        names). The parameter is not mandatory, because parameters could be
     *        defined by queryParameter or parameter method
     *
     * @return {Promise} promise which is resolved/rejected when request is done
     *
     * @memberof FunctionImport
     */
    public call(parameters?: any): Promise<any>;
    /**
     * Gets parameter definition.
     *
     * @protected
     * @param {string} parameterName name of the parameter
     * @returns {object} parameter definition, containing at least 'type'
     * @memberof FunctionImport
     */
    protected getParameterDefinition(parameterName: string): object;
    /**
     * Determine method of the class used for the HTTP request
     * for of the FunctionImport
     *
     * @private
     *
     * @returns {String} name of the method of the FunctionImport class
     *
     * @memberof FunctionImport
     */
    private httpMethod;
    /**
     * Send HTTP POST request to the OData server with url which define FunctionImport call
     *
     * @private
     *
     * @return {Promise} promise which is done where request is finished
     *
     * @memberof FunctionImport
     */
    private post;
    /**
     * Send HTTP GET request to the OData server with url which define FunctionImport call
     *
     * @private
     *
     * @return {Promise} promise which is done where request is finished
     *
     * @memberof FunctionImport
     */
    private get;
    /**
     * Normalize response and returns raw response or object or array
     *
     * @param {IncomingMessage} rawResponse from HTTP client
     * @param {Boolean} raw force to use raw response
     *
     * @returns {Object|Array} raw response object or object or results array
     *
     * @memberof FunctionImport
     */
    normalizeResponse(rawResponse: IncomingMessage, raw: boolean): any | any[];
    /**
     * Take FunctionImport parameters from queryParamters
     *
     * @private
     *
     * @return {[String]} array witch URL query parameters
     *
     * @memberof FunctionImport
     */
    private queryFromParameters;
}
import Resource = require("./Resource");
//# sourceMappingURL=FunctionImport.d.ts.map