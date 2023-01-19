export = Resource;
/**
 * Base object of the OData resources
 *
 * @class Resource
 */
declare class Resource {
    /**
     * Creates an instance of <code>Resource</code>.
     * @param {Agent} agent instance of the Agent class @see Agent.js
     * @param {Object} defaults default parameters for the resource, based on the class
     * @memberof Resource
     */
    constructor(agent: Agent, defaults?: any);
    /**
     * Gets new instance of default values.
     *
     * @returns {object} new default values instance
     *
     * @memberof Resource
     * @protected
     */
    protected getDefaults(): object;
    /**
     * Resets current default request.
     *
     * @memberof Resource
     * @protected
     */
    protected reset(): void;
    _requestDefinition: RequestDefinition;
    /**
     * Normalize default parameters to adding mandatory properties
     *
     * @param {Object} defaults which need to be normalized
     *
     * @returns {Object} normalized default parameters
     *
     * @memberof Resource
     */
    normalizeDefaults(defaults: any): any;
    /**
     * Check default parameters used by the Resource class
     *
     * @param {Object} defaults which need to be checked
     *
     * @returns {Object} default parameteres for chaining
     *
     * @memberof Resource
     */
    checkDefaults(defaults: any): any;
    parameter(parameterName: any, parameterValue: any): Resource;
    parameters(parameters: any): Resource;
    /**
     * Create new request definnition object for this entity.
     *
     * @returns {RequestDefinition} request definition
     * @memberof QueryableResource
     */
    request(): RequestDefinition;
    /**
     * Set additional header for the OData request to the resource
     *
     * @param {String} key name of the header
     * @param {String} value value of the header
     *
     * @return {Resource} itself for the chaining
     *
     * @memberof Resource
     */
    header(key: string, value: string): Resource;
    /**
     * After the call of the method the superagent response is resolved instead
     * of the plain objects
     *
     * @return {Resource} itself for the chaining
     *
     * @memberof Resource
     */
    raw(): Resource;
    /**
     * Get query parameter from the entity set query structure.
     *
     * @param {String} name name of the parameter
     *
     * @return {String} current value of the query parameter
     *
     * @memberof Resource
     */
    getQueryParameter(name: string): string;
    /**
     * Set query parameter to the get entity set list request
     * You can use the function instead of the specific methods
     * like search or top, but you have to follow the OData protocol.
     * @see https://www.odata.org/getting-started/basic-tutorial/
     * Particular function like top or search contains additionals
     * value checks, but queryParameter just pass value to the
     *
     * @param {String} name name of the parameter
     * @param {Any} [value] parameter value is optional, if it is
     *
     * @return {Resource} itself for the chaining
     *
     * @memberof Resource
     */
    setQueryParameter(name: string, value?: Any): Resource;
    /**
     * Set query parameter to the get entity set list request.
     *
     * @alias setQueryParameter
     *
     * @param {String} name name of the parameter
     * @param {Any} [value] parameter value is optional, if it is
     *
     * @return {Resource} itself for the chaining
     *
     * @memberof Resource
     */
    queryParameter(...args: any[]): Resource;
    /**
     * Convert query defined by queryParameter method to query part of URL
     *
     * @param {Object} defaultQueryParameters the default parameters which is replaced by this.defaultRequest.query
     *
     * @return {String} query part of the url based on the this.defaultRequest.query and defaultQueryParameters
     *
     * @memberof Resource
     */
    urlQuery(defaultQueryParameters?: any): string;
    /**
     * Gets (persistent) OData request definition for this entity set.
     *
     * @readonly
     * @private
     *
     * @returns {RequestDefinition} Request definition for this entity set
     *
     * @memberof Resource
     */
    private readonly get defaultRequest();
    /**
     * Wraps batch requeswt createion
     *
     * @param {function} call main call to batch
     * @param {Batch} batchObject destination fo the request defined by call patameter
     * @returns {Promise} promise which resolved when request is received from backend
     *
     * @private
     * @memberof QueryableResource
     */
    private _handleBatchCall;
}
import RequestDefinition = require("./RequestDefinition");
//# sourceMappingURL=Resource.d.ts.map