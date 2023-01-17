export = Request;
/**
 * Request class implements OData particular request processing
 *
 * @public
 * @class Request
 */
declare class Request {
    /**
     * Initialize instance of the batch Request class
     *
     * @param {String} httpMethod is string (GET/POST/MERGE/PUT/DELETE) which identifies HTTP method
     * @param {String} inputUrl is relative path to the service endpoint
     * @param {Object} headers is headers (Accept header has to be defined and it has to be application/json
     * @param {Any} payload body of the request
     *
     * @public
     * @memberof Request
     */
    constructor(httpMethod: string, inputUrl: string, headers: any, payload: Any);
    responseType: any;
    /**
     * Generate HTTP request which is part of thh multipart/mixed content for the OData batch
     *
     * @param {String} csrfToken passed to request headers
     *
     * @returns {String} request converted to the string
     *
     * @private
     * @memberof Request
     */
    private payload;
    /**
     * Create JSON string which contains body of the request
     *
     * @returns {String} JSON content
     *
     * @private
     * @memberof Request
     */
    private body;
    /**
     * Parse response part of the OData batch response for the particular specified
     *
     * @param {String} rawResponse - part of the batch response for the specified request
     *
     * @returns {Promise} promise which is resolved by the particular response is parsed
     *
     * @private
     * @memberof Batch
     */
    private process;
}
//# sourceMappingURL=Request.d.ts.map