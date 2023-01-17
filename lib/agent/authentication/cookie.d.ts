export = authenticate;
/**
 * Try to load service endpoint by cookie authentication
 *
 * @param {Object} settings - normalized OData library settings
 * @param {agent/Agent} agent - instance of superagent HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
declare function authenticate(settings: any, agent: any, endpointUrl: string): Promise<any>;
declare namespace authenticate {
    /**
     * Pass cookies for authentication to agent
     *
     * @param {Object} settings - normalized OData library settings
     * @param {agent/Agent} agent - instance of superagent HTTP client
     * @param {String} endpointUrl - url which is used for testing
     *
     * @return {Promise} the promise is resolved when cookies are set
     */
    function setCookiesToAgent(settings: any, agent: any, endpointUrl: string): Promise<any>;
    /**
     * Check response from service endpoint to determine
     * connection status. Throws for invalid statuses
     *
     * @param {HTTP.Response} response - object with HTTP response info
     *
     * @return {HTTP.Response} the valid response
     */
    function processResponse(response: HTTP.Response): HTTP.Response;
    const authenticatorName: string;
}
//# sourceMappingURL=cookie.d.ts.map