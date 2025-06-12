export = EntitySet;
/**
 * Envelope GET/POST/PUT/DELETE methods for particular EntitySet
 *
 * @class EntitySet
 * @extends {QueryableResource}
 */
declare class EntitySet extends QueryableResource {
    /**
     * Creates an instance of <code>EntitySet</code>.
     * @param {Agent} agent instance of the Agent class @see Agent.js
     * @param {Metadata} metadata instance of the metadata object that keeps service metadata
     * @param {Object} entitySetModel information about EntitySet parsed from Metadata
     * @memberof EntitySet
     */
    constructor(agent: Agent, metadata: Metadata, entitySetModel: any);
    isParameterized: boolean;
    valuesAssociation: any;
    /**
     * Creates a new NavigationProperty
     * @param {Metadata} metadata instance of the metadata object that keeps service metadata
     * @param {Object} navigationProperty navigation property parsed from metadata
     * @returns {Association} association instance @see NavigationProperty.js
     * @memberof EntitySet
     */
    createNavigationProperty(metadata: Metadata, navigationProperty: any): Association;
    /**
     * Gets navigation properties for current entity.
     *
     * @readonly
     * @memberof EntitySet
     */
    readonly get navigationProperties(): {};
    /**
     * Gets parameter definition.
     *
     * @protected
     * @param {string} parameterName name of the parameter
     * @returns {object} parameter definition, containing at least 'type'
     * @memberof EntitySet
     */
    protected getParameterDefinition(parameterName: string): object;
    /**
     * Gets path for parametrized entity set definition.
     *
     * @private
     * @returns {string} resource path
     * @memberof EntitySet
     */
    private _getParametrizedListPath;
    /**
     * Add action or function to entity set/ entity instance
     *
     * @param {Action} boundableResource bound action or function
     * @param {Agent} agent - instance of the agent which handler HTTP requests
     * @memberof EntitySet
     */
    addBoundObject(boundableResource: Action, agent: Agent): void;
    /**
     * Gets actions bound to entity set instance (entity type).
     *
     * @readonly
     * @memberof EntitySet
     */
    readonly get instanceActions(): any;
    /**
     * Send request to bound ODataV4 action
     *
     * @public
     * @param {engine.RequestDefinition} request odata definition
     * @return {Promise} promise resolved when call is finished
     * @memberof engine.EntitySet
     */
    public callAction(request: engine.RequestDefinition): Promise<any>;
    /**
     * Mark request definition as request for raw value ($value keyword)
     *
     * @param {String} [propertyName] name of property which is asked (if
     *        parameter is not set $value keyword will be use for whole
     *        entity}
     *
     * @return {EntitySet} itself for the chaining
     *
     * @memberof EntitySet
     */
    value(...args: any[]): EntitySet;
}
import QueryableResource = require("./QueryableResource");
//# sourceMappingURL=EntitySet.d.ts.map