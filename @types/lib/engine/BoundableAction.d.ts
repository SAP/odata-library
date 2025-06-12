export = Action;
/**
 * Javascript class which implements Action funcionality
 *
 * @class Action
 * @extends {Resource}
 */
declare class Action {
    /**
     * Creates an instance of <code>Action</code>.
     * @param {Agent} agent instance of the Agent class @see Agent.js
     * @param {Object} metadata information about Action from Metadata
     * @memberof Action
     */
    /**
     * Create function which directly call's action without
     * additional selection of the \"call\" method.
     *
     * @private
     *
     * @param {EntitySet} [entity] is entity instance to which is the action bound, EntitySet with key properties set
     * @param {ActionImport} [actionImport] is action import for unbound actions
     *
     * @return {Function} function which directly send request to the
     *                    Action
     *
     * @memberof Action
     */
    private createDirectCaller;
    /**
     * Call post/get method (base on the metadata) to create Action request
     *
     * @public
     *
     * @param {EntitySet} [entity] is entity instance to which is the action bound, EntitySet with key properties set
     * @param {ActionImport} [actionImport] is action import for unbound actions
     * @param {Object} [parameters] is object which contains key/values definiton
     *                            of parameter names and values (see service metadata
     *                            for parameter names). The parameter is not mandatory,
     *                            because parameters could be defined by queryParameter
     *                            or parameter method
     *
     * @return {Promise} promise which is resolved/rejected when request is done
     *
     * @memberof Action
     */
    public call(entity?: EntitySet, actionImport?: ActionImport, parameters?: any): Promise<any>;
    /**
     * Gets parameter definition.
     *
     * @protected
     * @param {string} parameterName name of the parameter
     * @returns {object} parameter definition, containing at least 'type'
     * @memberof Action
     */
    protected getParameterDefinition(parameterName: string): object;
    /**
     * Determine method of the class used for the HTTP request
     * for of the Action
     *
     * @private
     *
     * @returns {String} name of the method of the Action class
     *
     * @memberof Action
     */
    private httpMethod;
    /**
     * Send HTTP POST request to the OData server with url which define Action call
     *
     * @private
     *
     * @param {EntitySet} [entity] is entity instance to which is the action bound, EntitySet with key properties set
     * @param {ActionImport} [actionImport] is action import for unbound actions
     * @param {Object} [parameters] is object which contains key/values definiton
     *                            of parameter names and values (see service metadata
     *                            for parameter names). The parameter is not mandatory,
     *                            because parameters could be defined by queryParameter
     *                            or parameter method
     *
     * @return {Promise} promise which is done where request is finished
     *
     * @memberof Action
     */
    private post;
    /**
     * Gets action resource path
     *
     * @private
     *
     * @param {EntitySet} [entity] is entity instance (EntitySet with key properties set) to which is the action bound or undefined for unbound action
     * @param {ActionImport} [actionImport] is action import for unbound actions
     *
     * @return {string} path of the action resource
     *
     * @memberof Action
     */
    private getPath;
    getPayload(parameters: any, request: any): {};
}
//# sourceMappingURL=BoundableAction.d.ts.map