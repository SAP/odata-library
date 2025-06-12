export = BoundableResource;
/**
 * Javascript class which implements common functionality for Action
 * and Function classes.
 *
 * @class BoundableResource
 * @extends {Resource}
 */
declare class BoundableResource extends Resource {
    /**
     * Creates an instance of <code>BoundableResource</code>.
     * @param {Agent} agent instance of the Agent class @see Agent.js
     * @param {Object} metadata information about BoundableResource from Metadata
     * @memberof BoundableResource
     */
    constructor(agent: Agent, metadata: any);
    /**
     * Normalize response and returns raw response or object or array
     *
     * @param {IncomingMessage} rawResponse from HTTP client
     * @param {Boolean} raw force to use raw response
     *
     * @returns {Object|Array} raw response object or object or results array
     *
     * @memberof BoundableResource
     */
    normalizeResponse(rawResponse: IncomingMessage, raw: boolean): any | any[];
}
import Resource = require("./Resource");
//# sourceMappingURL=BoundableResource.d.ts.map