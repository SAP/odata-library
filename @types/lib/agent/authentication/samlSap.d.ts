export = authenticate;
/**
 * Try to load service endpoint with SAP specific SAML authentication
 *
 * @public
 *
 * @param {Object} settings - normalized OData library settings. contains
 *        user creadentials
 * @param {agent} agent - instance of  HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
declare function authenticate(settings: any, agent: any, endpointUrl: string): Promise<any>;
declare namespace authenticate {
    const authenticatorName: string;
    /**
     * Main function which goes thru SAML redirects to login form. Fill login form
     * and check result from its. Redirects SAML response back to destinatioin system
     * and resolve endpoint response after authentification.
     *
     * @private
     *
     * @param {Object} settings - normalized OData library settings. contains
     *        user creadentials
     * @param {agent} agent - instance of agent HTTP client
     * @param {Object} responseFromEndpointUrl - structure which contains all information
     *        about request and response from endpoint url before authentication
     *
     * @returns {Promise} promise which is resolve by response from endpont url after
     *        authentication or rejected for invalid credentials.
     */
    function samlHandshake(settings: any, agent: any, responseFromEndpointUrl: any): Promise<any>;
    /**
     * Process and reject error from endpointurl after SAML authentication.
     * Destination service could reject authorization or it could be down ...
     *
     * @private
     *
     * @param {Function} callBackError - reject function from new promise
     *        it is called with error
     * @param {Function} errorHttp - http error with response which contains
     *        error details
     */
    function processDestinationSystemError(callBackError: Function, errorHttp: Function): void;
    /**
     * Go thru SAML request/responses which is implemented as chain of the
     * requests/responses with HTML pages with forms
     *
     * @private
     *
     * @param {Function} requestGenerator - function which generates promise
     *        for next HTTP request or return null if previous requests was
     *        last in the request chain
     * @param {Promise} previousRequestPromise - promise which is resolved/rejected
     *        from previous requests in requests chain
     * @param {Function} callBack - resolve function from Promise object constructor
     *        it is called when requests chain is done
     * @param {Function} callBackError - reject function from new promise
     *        it is called with error on any request in chain
     */
    function followRequests(requestGenerator: Function, previousRequestPromise: Promise<any>, callBack: Function, callBackError: Function): void;
    /**
     * Generates handler which process SAML requests and responses
     *
     * @private
     *
     * @param {String} actionFunctionName - name of the function which
     *        creates requests for specified SAML chain (SAMLRequest,
     *        SAMLResponse or login form)
     *
     * @returns {Function} generated handler
     */
    function generateFormHandler(actionFunctionName: string): Function;
    const submitRedirectToLoginForm: Function;
    const submitLoginForm: Function;
    const submitRedirectFromLoginForm: Function;
    /**
     * Follow SAML from redirects to login form
     *
     * @private
     *
     * @param {Object} settings - normalized OData library settings. contains
     *        user creadentials
     * @param {agent} localAgent - instance of agent HTTP client
     * @param {Object} response from endpointUrl which is starting point for SAML authentificaton
     * @param {String} contentText content of response
     *
     * @return {agent} request (which mimic Promise) and is is resolved/rejected when login page
     *         is found
     */
    function submitRedirectToLoginFormAction(settings: any, localAgent: agent, response: any): agent;
    /**
     * Submit SAP SAML login form
     *
     * @private
     *
     * @param {Object} settings - normalized OData library settings. contains
     *        user creadentials
     * @param {agent} localAgent - instance of agent HTTP client
     * @param {Object} response from endpointUrl which is starting point for SAML authentificaton
     *
     * @return {agent} request (which mimic Promise) and is is resolved/rejected when login page
     *         is found
     */
    function submitLoginFormAction(settings: any, localAgent: agent, response: any): agent;
    /**
     * Process SAML response redirects by forms
     *
     * @private
     *
     * @param {Object} settings - normalized OData library settings. contains
     *        user creadentials
     * @param {agent} agent - instance of agent HTTP client
     * @param {Object} response from login page request
     *
     * @return {agent} request (which mimic Promise) and is is resolved/rejected when all SAML response
     *         forms are processed
     */
    function submitRedirectFromLoginFormAction(settings: any, agent: any, response: any): any;
    /**
     * Check valid response from login page. If response contains SAMLRequests
     * (sumbit from login page returns login page again) credentials is invalid.
     *
     * @private
     *
     * @param {Object} responseAfterLoginSubmit from login page request
     *
     * @return {Boolean} credentials are correct/incorrect true/false
     */
    function checkResponseFromLoginPage(responseAfterLoginSubmit: any): boolean;
    /**
     * Try to load service endpoint with SAP specific SAML authentication
     *
     * @private
     *
     * @param {Object} response - object generated by HTTP Client which
     *        contains all informations about HTTP response and HTTP request
     *        to OData endpoint
     *
     * @return {Promise} the promise is resolved when endpoint is correctly loaded,
     *                       the promise is rejected othewise
     */
    function isPossible(response: any): Promise<any>;
    /**
     * Parse text from HTTP response to DOM
     *
     * @private
     *
     * @param {Object} response - object generated by fetch with HTTP response
     *
     * @return {Promise} the promise is resolved when DOM is parsed
     */
    function readDom(response: any): Promise<any>;
}
//# sourceMappingURL=samlSap.d.ts.map