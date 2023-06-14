export = Agent;
/**
 * Service endpoint agent.
 * Handles all GET/POST/PUT/DELETE ... methods to the service endpoint.
 *
 * @class Agent
 */
declare class Agent {
    /**
     * Creates an instance of <code>Agent</code>.
     *
     * @param {Object} settings define service endpoint
     *
     * @memberof Agent
     */
    constructor(settings: any);
    /**
     * Initialize object merged with user definined options
     * for fetch and passed as options to the node-fetch
     *
     * @param {Object} settings define service endpoint
     *
     * @returns {Object} initialized options
     */
    initializeDefaultFetchOptions(settings: any): any;
    /**
     * Initialize logger instance
     *
     * @param {Object} settings define service endpoint
     *
     * @returns {Object} object which implements trace, debug, info, warn, error methods.
     *
     * @memberof Agent
     */
    initializeLogger(settings: any): any;
    /**
     * Convert parameters map to query string
     *
     * @param {Object} parameters - contains information which is user to request metadata
     *
     * @returns {String} search part of the metadata URL
     *
     * @memberof Agent
     */
    metadataSearch(parameters: any): string;
    /**
     * Send requests to service metadata
     *
     * @returns {Promise} which done when all metadata requests ar loaded and metadata is merged.
     *
     * @memberof Agent
     */
    metadata(): Promise<any>;
    /**
     * Creates metadata requests from url
     *
     * @param {string} metadataUrl URL of the metadata
     *
     * @returns {Promise} which done where metadata request is loaded
     *
     * @memberof Agent
     */
    createMetadataRequest(metadataUrl: string): Promise<any>;
    /**
     * Wrapper around GET function. All parameters are passed to fetch method
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the GET request
     *
     * @returns {Promise} promise which is done when GET request is finished
     *
     * @memberof Agent
     */
    get(...args: any[]): Promise<any>;
    /**
     * Wrapper around POST function. All parameters are passed to fetch method
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the post request
     * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
     *
     * @returns {Promise} promise which is done when POST request is finished
     *
     * @memberof Agent
     */
    post(...args: any[]): Promise<any>;
    /**
     * Wrapper around PUT function. All parameters are passed to fetch method
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the PUT request
     * @param {Object} payload data which is converted to the JSON string and passed as body of PUT request
     *
     * @returns {Promise} promise which done when PUT request is finished
     *
     * @memberof Agent
     */
    put(...args: any[]): Promise<any>;
    /**
     * Wrapper around fetch API http requests. All parameters are passed to fetch
     *
     * @private
     *
     * @param {String} httpMethod name of the HTTP method
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the post request
     * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
     *
     * @returns {Promise} which done when request of HTTP method definned by parameters has finished
     *
     * @memberof Agent
     */
    private sendRequest;
    /**
     * Send batch request defined by the batch object passed as parameter
     *
     * @private
     *
     * @param {Object} [batch] represents batch request, if batch is not
     *        passed use default batch from batch/Manager
     * @param {Boolean} raw if the parameter is false response contains
     *        just array of parsed OData responses. If the parameter is true
     *        response contains HTTP.Response with property batchResponse.
     *        The batchResponses contains list of particular respones from
     *        the requests send over bulk batch request.
     *
     * @returns {Promise} which done when batch request is resolved
     *
     * @memberof Agent
     */
    private batch;
    /**
     * Wrapper around MERGE function. All parameters are passed to fetch. MERGE request
     * is supported by OData protocol 2.0 and older.
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the MERGE request
     * @param {Object} payload data which is converted to the JSON string and passed as body of MERGE request
     *
     *
     * @returns {Promise} promise which done when MERGE request has finished
     *
     * @memberof Agent
     */
    merge(...args: any[]): Promise<any>;
    /**
     * Create PATCH request. Patch updates the entity. It is supported by OData protocol
     * version 3.0 and newer.
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the GET request
     * @param {Object} payload data which is converted to the JSON string and passed as body of MERGE request in batch
     *
     * @returns {Promise} promise which done when PATCH request has finished
     *
     * @public
     * @memberof Agent
     */
    public patch(...args: any[]): Promise<any>;
    /**
     * Wrapper around DELETE function. All parameters are passed to fetch method
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the delete request
     *
     * @returns {Promise} which is done where delete request has done
     *
     * @memberof Agent
     */
    delete(inputUrl: string, headers: any): Promise<any>;
    /**
     * Send request to fetch CSRF token from backend.
     *
     * @param {String} inputUrl relative path in the service
     *
     * @returns {Promise} which done where token has loaded
     *
     * @memberof Agent
     */
    fetchToken(): Promise<any>;
    /**
     * Send batch request defined by the batch object passed as parameter
     *
     * @private
     *
     * @param {HTTP.Response} batchResponse response to batch request
     * @param {Object[]} requestsResponses list of responses parsed from batch response
     * @param {Boolean} raw if the parameter is false returns values contains
     * just array of parsed OData responses. If the parameter is true
     * returns batchResponse with list particular responses from batch.
     *
     * @returns {Promise} promise with array or responses parsed from batch
     *          response or batch response object
     *
     * @memberof Agent
     */
    private normalizeBatchResponse;
    /**
     * Determine path to result content
     *
     * @param {Boolean} isList true if result is array
     * @param {Object} result object with response from backend
     *
     * @return {String} path with dot notation to content of response
     */
    getResultPath(isList: boolean, result: any): string;
    /**
     * Initialize version dependent properties
     *
     * @param {String} version identification of currect service version
     */
    setServiceVersion(version: string): void;
    /**
     * Envelope (fetch API) to support authentication
     *
     * @public
     *
     * @param {String} requestUrl endpoint for HTTP request
     * @param {Object} [opts] options passed to enveloped fetch (with auth parameters)
     *
     * @returns {Promise} promise which is resolved when HTTP request is done
     */
    public fetch(requestUrl: string, opts?: any): Promise<any>;
    /**
     * Append counter to the response as identification for content log
     * after its processing
     *
     * @private
     *
     * @param {Number} counter sequence number for currrent request
     * @param {String} requestUrl endpoint for HTTP request
     * @param {Object} opts options passed to enveloped fetch (with auth parameters)
     * @param {HTTP.Response} response from fetch
     *
     * @returns {Promise} promise which is resolved when HTTP response is procesed
     */
    private processResponse;
    /**
     * Redirect response
     *
     * @private
     *
     * @param {Number} counter sequence number for currrent request
     * @param {String} requestUrl endpoint for HTTP request
     * @param {Object} opts options passed to enveloped fetch (with auth parameters)
     * @param {HTTP.Response} response from fetch
     *
     * @returns {Promise} promise which is resolved when redirect is processed
     */
    private redirect;
    /**
     * Create URL for next hop from current response and current
     * action in form (form sometimes contains all URL and sometimes
     * just path.
     *
     * @private
     *
     * @param {String} requestedUrl path or fullurl from action attribute
     *        of SAML/Login form
     * @param {Object} response object with last response which contains
     *        requested URL
     *
     * @returns {String} full url
     */
    private nextRequestUrl;
    /**
     * Read cookies from local cookie storag
     *
     * @private
     *
     * @param {String} requestUrl endpoint for HTTP request
     *
     * @returns {Promise} promise which is resolved when cookies has read
     */
    private readCookies;
    /**
     * Finds out if response is redirect
     *
     * @private
     *
     * @param {HTTP.Response} response from fetch
     * @param {Number} follow is the follow header from request options
     * @param {Boolean} isRequestedManualRedirect determine manual redirect management
     *
     * @returns {Boolean} true if response is redirect to other HTTP url
     */
    private isResponseRedirect;
    /**
     * Safely add additional headers to the request headers
     *
     * @private
     *
     * @param {Object} headers additional headers
     * @param {Object} opts object which is passed to the fetch and which is updated
     */
    private appendHeaders;
    /**
     * Save cookie to local cookie storage
     *
     * @private
     *
     * @param {HTTP.Response} response from fetch
     *
     * @return {Promise} promise which is resolved when cookies are saved
     */
    private saveCookies;
    setAuthorizationHeaders(authorizationHeaders: any): void;
    [CSRF_TOKEN]: any;
    [AUTH_HEADERS]: any;
}
declare const CSRF_TOKEN: unique symbol;
declare const AUTH_HEADERS: unique symbol;
//# sourceMappingURL=Agent.d.ts.map