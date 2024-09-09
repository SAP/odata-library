export = QueryableResource;
/**
 * Envelope GET/POST/PUT/DELETE methods for particular QueryableResource
 *
 * @class QueryableResource
 * @extends {Resource}
 */
declare class QueryableResource extends Resource {
    /**
     * Creates an instance of <code>QueryableResource</code>.
     * @param {Agent} agent instance of the Agent class @see Agent.js
     * @param {Metadata} metadata instance of the metadata object that keeps service metadata
     * @param {Object} entitySetModel information about EntitySet parsed from Metadata
     * @param {Object} entityTypeModel information about EntityType parsed from Metadata
     * @memberof QueryableResource
     */
    constructor(agent: Agent, metadata: Metadata, entitySetModel: any, entityTypeModel: any);
    top(top: any): QueryableResource;
    select(...args: any[]): QueryableResource;
    skip(skip: any): QueryableResource;
    filter(filter: any): QueryableResource;
    orderby(...args: any[]): QueryableResource;
    expand(...args: any[]): QueryableResource;
    search(pattern: any): QueryableResource;
    key(entityKey: any): EntitySet;
    /**
     * Send request to count of the EntitySet
     *
     * @param {RequestDefinition} [request] optional request definition (default entity set request is used as default)
     *
     * @return {Promise} returned promise is resolved when request is finished
     *
     * @memberof QueryableResource
     */
    count(request?: RequestDefinition): Promise<any>;
    /**
     * Sends GET request to the entity set.
     *
     * @param {*} args some arguments
     * supported argument variants
     * 1. one number argument -> list top query
     * 2. no arguments and key defined -> get entity entity
     * 3. one plain object argument -> get entity with key from this object
     * 4. no arguments and key not defined -> list query
     *
     * @return {Promise} returned promise is resolved when request is finished
     * @memberof QueryableResource
     */
    get(...args: any): Promise<any>;
    /**
     * Send request to create new entity by HTTP POST method
     *
     * @param {String} body map of the new entity which is end to the new repository
     *
     * @return {Promise} returned promise is resolved when request is finished
     * Promise is resolved with response object which contains res.body and body
     * contains newly created object.
     *
     * @memberof QueryableResource
     */
    post(body: string): Promise<any>;
    /**
     * Determine if the body is plain request
     *
     * @param {String} body map of the new entity which is end to the new repository
     *
     * @return {Boolean} true if the body is plain request
     */
    isPlainRequest(body: string): boolean;
    /**
     * Check input parameters for post method
     *
     * @param {String} body map of the new entity which is end to the new repository
     * @param {Batch} defaultBatch default batch for the request
     *
     * @return {Error} error if the parameters are not valid
     */
    checkPostParameters(body: string, defaultBatch: Batch): Error;
    /**
     * Send POST request without additional processing
     *
     * @param {String} path path to the entity set
     * @param {String} body Buffer/FormData (or any other data with slug header)
     *
     * @return {Promise} returned promise is resolved when request is finished
     */
    postPlainRequest(path: string, body: string): Promise<any>;
    /**
     * Add POST request to the batch
     *
     * @param {String} path path to the entity set
     * @param {String} body map of the new entity which is end to the new repository
     * @param {Batch} defaultBatch default batch for the request
     *
     * @return {Promise} returned promise is resolved when request is finished
     */
    postBatchRequest(path: string, body: string, defaultBatch: Batch): Promise<any>;
    /**
     * Send POST request with JSON body (standard OData request)
     *
     * @param {String} path path to the entity set
     * @param {String} body map of the new entity which is send to the odata endpoint
     *
     * @return {Promise} returned promise is resolved when request is finished
     */
    postJSONRequest(path: string, body: string): Promise<any>;
    /**
     * Send request to update an entity by HTTP PUT method
     *
     * @param {String} body map of new data for the entity
     *
     * @return {Promise} returned promise is resolved when request is finished
     * Promise is resolved with response object which doesn't contain body
     *
     * @memberof QueryableResource
     */
    put(body: string): Promise<any>;
    /**
     * Send request to update an entity by HTTP MERGE method (update for
     * OData protocol version 1.0-2.0)
     *
     * @param {Object} body map of key properties and new data for the entity
     * @param {Object} [propertiesToChange] map of new data for the entity
     *
     * @return {Promise} returned promise is resolved when request is finished
     * Promise is resolved with response object which doesn't contain body
     *
     * @memberof QueryableResource
     */
    merge(...args: any[]): Promise<any>;
    /**
     * Send request to update an entity by HTTP MERGE method
     *
     * @param {Object} body map of key properties and new data for the entity
     * @param {Object} [propertiesToChange] map of new data for the entity
     *
     * @return {Promise} returned promise is resolved when request is finished
     * Promise is resolved with response object which doesn't contain body
     *
     * @memberof QueryableResource
     */
    patch(...args: any[]): Promise<any>;
    /**
     * Send request to update entity via MERGE or PATCH method. The method
     * unify code for patch and merge methods.
     *
     * @param {String} methodName name of method from agent "merge" or "patch"
     * @param {Object} body map of key properties and new data for the entity
     * @param {Object} [propertiesToChange] map of new data for the entity
     *
     * @return {Promise} returned promise is resolved when request is finished
     * Promise is resolved with response object which doesn't contain body
     *
     * @private
     * @memberof QueryableResource
     */
    private processUpdateCall;
    /**
     * Send request to delete an entity by HTTP DELETE method
     *
     * @param {String} properties map of key properties of the entity which is to be deleted
     *
     * @return {Promise} returned promise is resolved when request is finished
     * Promise is resolved with response object which doesn't contain body
     *
     * @memberof QueryableResource
     */
    delete(properties: string, ...args: any[]): Promise<any>;
    /**
     * Send GET request to fetch entities requested by clauses like filter, top, count ...
     *
     * @private
     * @param {RequestDefinition} request request definition
     * @return {Promise} returned promise is resolved when request is finished
     * @memberof QueryableResource
     */
    private executeGet;
    /**
     * Filter entity object to key properties for the EntitySet
     *
     * @private
     * @param {Object} entity whole entity as Object
     *
     * @return {Object} the part of the entity with the key properties only
     *
     * @memberof QueryableResource
     */
    private keyProperties;
    /**
     * Convert object with the entity key properties to URI component
     *
     * @protected
     * @param {Object} entityKey part of the entity with key properties
     *
     * @return {String} the part of URI which is used as key
     *
     * @memberof QueryableResource
     */
    protected keyPredicate(entityKey: any): string;
    /**
     * Gets path to the single entity (with key defined)
     * @returns {string} path to the single entity
     * @memberof QueryableResource
     */
    getSingleResourcePath(): string;
    /**
     * Gets path to the list of entities
     * @returns {string} path to the list of entities
     * @memberof QueryableResource
     */
    getListResourcePath(): string;
    /**
     * Convert Object with values to Object with values converted to the
     * OData primitives
     *
     * @param {Object} body map of key properties and new data for the entity
     *
     * @return {Object} Object with converted values
     *
     * @private
     * @memberof QueryableResource
     */
    private bodyProperties;
    /**
     * Convert Object with values to Object with values converted to the
     * OData primitives
     *
     * @param {Object} entityTypeProperties map of key properties and new data for the entity
     * @param {Object} entityTypeModelProperties contains definitions of the properties from EntityType
     *        which is used to format and check body properties
     *
     * @return {Object} Object with converted values
     *
     * @private
     * @memberof QueryableResource
     */
    private processProperties;
    /**
     * Format and check navigation properties objects
     *
     * @param {Object} entityTypeProperties is object which contains navigation properties represented
     *        by nested objects
     * @param {Object} entityTypeModel model of the entity type which is used to generate navigation properties
     *        payload
     *
     * @return {Object} Object with formatted and checked navigation properties objects
     *
     * @private
     * @memberof QueryableResource
     */
    private processNavigationProperties;
    /**
     * Go thru navigation propert items for active operations
     * (post, merge, put)
     *
     * @param {NavigationProperty} navigationProperty object which represents
     *        navigation property definition for v2 or v4
     * @param {Object} entityTypeProperties data for navigation properties
     *
     * @returns {Object} checked navigation properties items
     */
    processNavigationPropertyItems(navigationProperty: NavigationProperty, entityTypeProperties: any): any;
    /**
     * Creates a new association
     *
     * virtual method that has to be implemented in each inherited class
     * due to circular dependency
     *
     * @protected
     * @memberof QueryableResource
     */
    protected createNavigationProperty(): void;
    /**
     * Wraps agent call (preparation, result parsing, error handling).
     *
     * @param {function} call main call to agent (async)
     * @param {RequestDefinition} requestDefinition optional request definition
     * @returns {object} value parsed from response
     *
     * @private
     * @memberof QueryableResource
     */
    private _handleAgentCall;
    /**
     * Set up headers for particular request
     *
     * @param {RequestDefinition} request definition of request
     *
     * @private
     * @memberof QueryableResource
     */
    private determineRequestHeaders;
    /**
     * Returns value from response objects which is
     *
     * @param {RequestDefinition} request definition of request
     * @param {IncommingMessage} response object from OData server
     *
     * @return {*} Buffer (for stream) or IncommingMessage (for raw response) or Object for JSON response
     *
     * @private
     * @memberof QueryableResource
     */
    private determineResponseResult;
    /**
     * Unwrap expanded navigation properties
     *
     *  @param {Object} response Recieved response
     *  @returns {Object} Response with unwrapped expanded navigation properties
     *
     * @private
     * @memberof QueryableResource
     */
    private _unwrapNestedProperties;
}
import Resource = require("./Resource");
//# sourceMappingURL=QueryableResource.d.ts.map