export = RequestDefinition;
/**
 * Envelope OData request
 *
 * @class RequestDefinition
 */
declare class RequestDefinition {
    /**
     * Creates an instance of RequestDefinition.
     * @param {*} resource owning resource
     * @param {*} defaults initial query values
     * @memberof RequestDefinition
     */
    constructor(resource: any, defaults: any);
    /**
     * Send request to count of the EntitySet
     *
     * @return {Promise} returned promise is resolved when request is finished
     *
     * @memberof QueryableResource
     */
    count(): Promise<any>;
    _isCount: boolean;
    /**
     * Sends GET request to the entity set.
     *
     * @param {*} args some arguments
     * supported argument variants
     * 1. no arguments and key not defined -> list query
     * 2. no arguments and key defined -> get entity entity
     * 3. one plain object argument -> get entity with key from this object
     * 4. one number argument -> list top query
     *
     * @return {Promise} returned promise is resolved when request is finished
     * @memberof QueryableResource
     */
    get(...args: any): Promise<any>;
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
     * Set additional header for the OData request to the resource
     *
     * @param {String} key name of the header
     * @param {String} value value of the header
     *
     * @return {RequestDefinition} itself for the chaining
     *
     * @memberof RequestDefinition
     */
    header(key: string, value: string): RequestDefinition;
    /**
     * Set key definiton for the entity set reading
     *
     * @param {Object} entityKey plain object with definition of the key
     *
     * @return {EntitySet} itself for the chaining
     *
     * @memberof QueryableResource
     */
    key(entityKey: any): EntitySet;
    _keyValue: any;
    /**
     * Add parameter to the current request
     *
     * @param {String} parameterName is name of the parameter
     * @param {*} parameterValue is value passed as parameter
     *
     * @returns {RequestDefinition} itself for chaining
     *
     * @memberof RequestDefinition
     */
    parameter(parameterName: string, parameterValue: any): RequestDefinition;
    /**
     * Add parameters to the current request
     *
     * @param {Object} [parameters] is object which contains key/values for parameters
     * @returns {RequestDefinition} itself for chaining
     * @memberof RequestDefinition
     */
    parameters(parameters?: any): RequestDefinition;
    /**
     * After the call of the method the superagent response is resolved instead
     * of the plain objects
     *
     * @return {RequestDefinition} itself for the chaining
     *
     * @memberof RequestDefinition
     */
    raw(): RequestDefinition;
    _isRaw: boolean;
    /**
     * Creates Object with OData Associations wrappers
     * @returns {RequestDefinition} itself for the chaining
     * @memberof RequestDefinition
     */
    registerAssociations(): RequestDefinition;
    navigationProperties: {};
    /**
     * Search parameter is SAP enhancement for fulltext search
     * in the EntitySet values
     *
     * @param {String} pattern string which is used as pattern for the fulltext searcb
     *
     * @return {RequestDefinition} itself for the chaining
     *
     * @memberof RequestDefinition
     */
    search(pattern: string): RequestDefinition;
    /**
     * Limit properties which is fetched from OData server
     *
     * @param {String|[String]} propertyName name of the property which is selected
     *        You can pass more parameterNames at once also:
     *
     * @example
     *        service.EntitySetName.select("Property_Name_1", "Property_Name_1");
     *        service.EntitySetName.select(["Property_Name_1", "Property_Name_1"]);
     *
     * @see
     *        https://www.odata.org/getting-started/basic-tutorial/#select
     *
     * @return {RequestDefinition} itself for the chaining
     *
     * @memberof RequestDefinition
     */
    select(...args: any[]): RequestDefinition;
    /**
     * Sets filter for entity list query.
     *
     * @param {String} filter filter expression
     *
     * @example
     * 		service.EntitySetName.orderby("Property_1 eq 'x'");
     *
     * @returns {RequestDefinition} itself to allow method chaining
     *
     * @memberof RequestDefinition
     */
    filter(filter: string): RequestDefinition;
    /**
     * Sets sort order for entity list query.
     *
     * @param {String|[String]} args property sort expression(s), asc is default sort direction
     *
     * @example
     * 		service.EntitySetName.orderby("Property_1");
     * 		service.EntitySetName.orderby("Property_1", "Property_2 desc");
     *
     * @returns {RequestDefinition} itself to allow method chaining
     *
     * @memberof RequestDefinition
     */
    orderby(...args: string | [string]): RequestDefinition;
    /**
     * Specifies the related resources to be included in line with retrieved resources.
     *
     * @param {String|[String]} path path to resource to be expanded
     *        You can pass more parameterNames at once also:
     *
     * @example
     *        service.EntitySetName.expand("Property_1", "Property_2/Property_3");
     *        service.EntitySetName.expand(["Property_1", "Property_2/Property_3"]);
     *
     * @see
     *        https://www.odata.org/getting-started/basic-tutorial/#expand
     *
     * @return {RequestDefinition} itself for the chaining
     *
     * @memberof RequestDefinition
     */
    expand(...args: any[]): RequestDefinition;
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
     * @return {RequestDefinition} himself for the chaining
     *
     * @memberof RequestDefinition
     */
    setQueryParameter(name: string, value?: Any): RequestDefinition;
    _query: any;
    /**
     * Set offset which is used read the entities
     *
     * @param {Number} skip is number of entities which to be skipped
     *
     * @return {EntitySet} itself for the chaining
     *
     * @memberof QueryableResource
     */
    skip(skip: number): EntitySet;
    /**
     * Limit number of values which is returned from the service
     *
     * @param {Number} top is number of records which could to be returned
     *
     * @return {RequestDefinition} itself for the chaining
     *
     * @memberof RequestDefinition
     */
    top(top: number): RequestDefinition;
    /**
     * Caculate path for GET request.
     *
     * @private
     *
     * @memberof RequestDefinition
     */
    private calculatePath;
    _path: any;
    /**
     * Determines if GET target is list.
     *
     * @returns {bool} true if target can contain multiple values
     *
     * @private
     * @memberof RequestDefinition
     */
    private get _isList();
    get _isEntity(): any;
    /**
     * Set payload definiton for the entity set create/update operations
     *
     * @param {Object} payload plain object with definition payload
     *
     * @return {RequestDefinition} itself for the chaining
     *
     * @memberof RequestDefinition
     */
    payload(payload: any): RequestDefinition;
    _payload: any;
    /**
     * Populate actions to the service object
     *
     * @param {engine.Action[]} actions array of action defintions
     *
     * @memberof RequestDefinition
     */
    populateActions(actions: engine.Action[]): void;
    actions: {};
    /**
     * Mark request definition as request for raw value ($value keyword)
     *
     * @param {String} [propertyName] name of property which is asked (if
     *        parameter is not set $value keyword will be use for whole
     *        entity}
     *
     * @return {RequestDefinition} itself for the chaining
     *
     * @memberof RequestDefinition
     */
    value(propertyName?: string, ...args: any[]): RequestDefinition;
    _isValue: boolean;
    _valuePropertyName: string;
}
//# sourceMappingURL=RequestDefinition.d.ts.map