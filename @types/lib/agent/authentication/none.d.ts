export = authenticate;
/**
 * Try to load service endpoint without any authentification
 *
 * @param {Object} settings - normalized OData library settings
 * @param {agent/Agent} agent - instance of superagent HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
declare function authenticate(settings: Object, agent: any, endpointUrl: string): Promise<any>;
declare namespace authenticate {
    let authenticatorName: string;
}
//# sourceMappingURL=none.d.ts.map