export = BoundableFunction;
/**
 * Javascript class which implements OData Function
 *
 * @class Function
 * @extends {Resource}
 */
declare class BoundableFunction {
    /**
     * Creates an instance of <code>BoundableFunction</code>.
     * @param {Agent} agent instance of the Agent class @see Agent.js
     * @param {Object} metadata information about OData Function from Metadata
     * @memberof BoundableFunction
     */
    /**
     * Create function which directly call's action without
     * additional selection of the \"call\" method.
     *
     * @private
     *
     * @param {EntitySet} [entity] is entity instance to which is the action bound, EntitySet with key properties set
     *
     * @return {Function} function which directly send request to the
     *                    Action
     *
     * @memberof BoundableFunction
     */
    private createDirectCaller;
    /**
     * Call get method to create Function request
     *
     * @public
     *
     * @param {EntitySet} [entity] is entity instance to which is the function
     *        bound EntitySet with key properties set
     * @param {Object} [parameters] is object which contains key/values definition
     *        of parameter names and values (see service metadata for parameter
     *        names). The parameter is not mandatory, because parameters could be
     *        defined by queryParameter or parameter method
     *
     * @return {Promise} promise which is resolved/rejected when request is done
     *
     * @memberof BoundableFunction
     */
    public call(entity?: EntitySet, parameters?: any): Promise<any>;
    /**
     * Create batch/direct call to the function from the odata service.
     *
     * @param {EntitySet} entity is entity instance to which is the function bound
     * @param {Object} parameters is object which contains key/values definition
     *
     *
     * @return {Promise} promise which is resolved/rejected when request is done
     * @private
     */
    private get;
    generatePath(entity: any, parameters: any): string;
}
//# sourceMappingURL=BoundableFunction.d.ts.map