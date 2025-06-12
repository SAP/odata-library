export = Service;
/**
 * OData service client implementation.
 *
 * See https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-odata/2b686a1a-9e1f-456f-80ff-072a010fc278 for detailed info on OData.
 *
 * <h3>Properties</h3>
 *
 * <ul>
 *   <li>agent - wrapped fetch API which contains current authorization</li>
 *   <li>init - promise which is resolved when Metadata are loaded and processed</li>
 *   <li>metadata - instance of the Metadata object, which contains metadata infromations and methods for finding out them</li>
 *   <li>entitySets - object which contains instance EntitySets objects for work with them</li>
 *   <li>functionImports - object which contains instance FunctionImport objects for work with them</li>
 * </ul>
 *
 * @class Service
 */
declare class Service {
    /**
     * Creates an instance of <code>Service</code>.
     * @param {String|Object} [args] Settings which defines URL, authrization and additional parameters of the OData service
     * @memberof Service
     */
    constructor(args?: string | any);
    /**
     * Creates OData client properties
     *
     * @param {Object} settings - structure which contains service endpoint definition
     *                              @see {@link parseConnection}
     *
     * @memberof Service
     */
    initializeProperties(settings: any): void;
    /**
     * Creates Object with OData EntitySet wrappers
     *
     * @param {Agent} agent - instance of the agent which handler HTTP requests
     * @param {Metadata} metadata - instance of the metadata object which keep serviice metadata
     *
     * @return {Object}  returns map which contains EntitySets instances
     *
     * @memberof Service
     */
    buildEntitySets(agent: Agent, metadata: Metadata): any;
    /**
     * Build endpoints for Functions of OData service (version 4.0)
     *
     * @param {Agent} agent - instance of the agent which handler HTTP requests
     * @param {Metadata} metadata - instance of the metadata object which keep serviice metadata
     * @param {Object} entitySets - object which contains EntitySets instances for bound functions
     *
     * @return {Object}  empty object, because unbound functions are not supported
     *  @memberof Service
     */
    buildFunctionObjects(agent: Agent, metadata: Metadata, entitySets: any): any;
    /**
     * Build endpoints for Actions of OData service (version 4.0)
     *
     * @param {Agent} agent - instance of the agent which handler HTTP requests
     * @param {Metadata} metadata - instance of the metadata object which keep serviice metadata
     * @param {Object} entitySets - object which contains EntitySets instances for bound actions
     *
     * @return {Object}  returns map which contains ActionImport instances
     *  @memberof Service
     */
    buildActionObjects(agent: Agent, metadata: Metadata, entitySets: any): any;
    /**
     * Creates Object with OData FunctionImport wrappers
     *
     * @param {Agent} agent - instance of the agent which handler HTTP requests
     * @param {Metadata} metadata - instance of the metadata object which keep serviice metadata
     *
     * @return {Object}  returns map which contains EntitySets instances
     *
     * @memberof Service
     */
    buildFunctionImports(agent: Agent, metadata: Metadata): any;
    /**
     * Create batch and register it to the agent's batch manager
     *
     * @returns {Object} batch object which represents batch request
     *
     * @memberof Service
     */
    createBatch(): any;
    /**
     * Sends batch passed as parameter or default batch from agents batch manager
     *
     * @param {Object} batch object which represents batch request
     * @param {Boolean} raw if the parameter is true just return batch response object
     *
     * @returns {Promise}  returns promise which is resolved when batch requests is received
     *
     * @memberof Service
     */
    sendBatch(...args: any[]): Promise<any>;
    /**
     * Create batch for default or explicit batch
     *
     * @param {Batch} batch object which represents explicit batch
     *
     * @returns {ChangeSet}  returns new changeset object
     *
     * @public
     * @memberof Service
     */
    public createChangeSet(batch: Batch): ChangeSet;
    /**
     * Commit requests to changesets (close changeset for adding new changesets)
     * The changeset could by commited explicitly or by default changeset of the
     * passed chatch or by default changes of default batch (without passed parameters)
     *
     * @param {Batch|ChangeSet} [batchItem] changeset to be commited or batch which
     *        default changeset to be commited
     *
     * @public
     * @memberof Service
     */
    public commitChangeSet(batchItem?: Batch | ChangeSet, ...args: any[]): void;
}
import Agent = require("./agent/Agent");
import Metadata = require("./model/Metadata");
import Batch = require("./agent/batch/Batch");
import ChangeSet = require("./agent/batch/ChangeSet");
//# sourceMappingURL=Service.d.ts.map