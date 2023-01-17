export = NavigationProperty;
/**
 * Envelope GET/POST methods for particular Navigation Property.
 *
 * @class NavigationProperty
 * @extends {QueryableResource}
 */
declare class NavigationProperty extends QueryableResource {
    /**
     * Creates an instance of <code>NavigationProperty</code>.
     *
     * @param {EntitySet} source instance of the EntitySet class @see EntitySet.js
     * @param {Object} navigationProperty information about NavigationProperty
     * @param {Metadata} metadata instance of the metadata object that keeps service metadata
     *
     * @public
     * @memberof NavigationProperty
     */
    constructor(source: EntitySet, navigationProperty: any, metadata: Metadata);
    /**
     * Indicates of the NavigationProperty Multiplicity is multiple or not
     * @returns {Boolean} true if the multiplicity is *
     * @memberof NavigationProperty
     */
    isMultiple(): boolean;
    /**
     * Creates a new Navigation Property
     * @param {Metadata} metadata instance of the metadata object that keeps service metadata
     * @param {Object} navigationProperty navigation property parsed from metadata
     * @returns {NavigationProperty} association instance @see NavigationProperty.js
     * @memberof NavigationProperty
     */
    createNavigationProperty(metadata: Metadata, navigationProperty: any): NavigationProperty;
    /**
     * Set key definiton for the entity set reading
     *
     * @return {NavigationProperty} itself for the chaining
     *
     * @memberof RequestDefinition
     */
    key(...args: any[]): NavigationProperty;
}
import QueryableResource = require("./QueryableResource");
//# sourceMappingURL=NavigationProperty.d.ts.map