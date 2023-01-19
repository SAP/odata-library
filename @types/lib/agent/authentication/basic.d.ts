export = authenticate;
/**
 * Try to load service endpoint with basic authentication
 *
 * @param {Object} settings - normalized OData library settings. contains
 *        user creadentials
 * @param {Agent} agent - instance of superagent HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
declare function authenticate(settings: any, agent: Agent, endpointUrl: string): Promise<any>;
declare namespace authenticate {
    function isValidResponse(response: any): boolean;
    const authenticatorName: string;
}
//# sourceMappingURL=basic.d.ts.map