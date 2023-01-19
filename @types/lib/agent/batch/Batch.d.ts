export = Batch;
/**
 * Batch class implements OData batch request and response processing
 *
 * @public
 * @class Batch
 */
declare class Batch extends Base {
    /**
     * Initialize instance of the Batch class
     *
     * @public
     * @memberof Batch
     */
    constructor();
    /**
     * Add new item to the batch list object
     *
     * @param {String} httpMethod name of the HTTP method
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the post request
     * @param {Object} payload data which is converted to the JSON string and passed as body of POST request in batch
     * @param {batch/ChangeSet} [changeSet] object which defines the changeset which
     *        contains the requests if the parameter is not defined the batch will try
     *        to find the active changeset in the batch automatically
     *
     * @returns {Object} new instance of Request class
     *
     * @private
     * @memberof Batch
     */
    private addRequest;
    /**
     * Create request in batch with payload
     *
     * @param {String} httpMethod name of the HTTP method
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the GET request
     * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
     * @param {batch/ChangeSet} changeSet which contains newly created request
     *
     * @returns {batch/Request} instance of batch Request
     *
     * @private
     * @memberof Agent
     */
    private addRequestWithPayload;
    /**
     * Try to find passed changeSet in the current batch. If changeSet is not
     * defined and the batch contains only one batch. Use it.
     *
     * @private
     *
     * @param {batch/ChangeSet} [changeSet] object which defines the changeset
     *
     * @returns {batch/ChangeSet} correctly found changeSet from the batch or undefined
     *
     * @memberof Batch
     */
    private get defaultChangeSet();
    /**
     *
     * The indexOf method returns the first index at which a given element can be
     * found in the array, or -1 if it is not present.
     *
     * @public
     *
     * @param {batch/ChangeSet|batch/Request} batchItem part of the batch a request or a changeset
     *
     * @returns {Number} index of the batchItem or -1
     *
     * @memberof Batch
     */
    public indexOf(batchItem: any): number;
    /**
     *
     * Create new changeset
     *
     * @public
     *
     * @returns {batch/ChangeSet} created change set
     *
     * @memberof Batch
     */
    public createChangeSet(): batch;
    /**
     * Generate multipart/mixed content for the OData batch
     *
     * @param {String} csrfToken passed to create valid particular request in batch payload
     *
     * @returns {String} boundary used by the batch response
     *
     * @private
     * @memberof Batch
     */
    private payload;
    /**
     * Parse response from OData response and resolve/reject promises of the particular
     * batch requests.
     *
     * @param {String} batchResponse - content of the response from http batch request
     *
     * @returns {Promise} promise which is resolved by the particular responses inside the batch
     *
     * @private
     * @memberof Batch
     */
    private process;
    /**
     * Create GET request in batch
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the GET request
     * @param {batch/ChangeSet} changeSet which contains newly created request
     * @param {Number} useResponseType requested type of response constant defined
     *        in lib/engine/responseType
     *
     * @returns {batch/Request} instance of batch Request
     *
     * @memberof Agent
     */
    get(inputUrl: string, headers: any, changeSet: any, useResponseType: number): batch;
    /**
     * Create POST request in batch
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the GET request
     * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
     * @param {batch/ChangeSet} changeSet which contains newly created request
     *
     * @returns {batch/Request} instance of batch Request
     *
     * @public
     * @memberof Agent
     */
    public post(...args: any[]): batch;
    /**
     * Create PUT request in batch. The PUT request replaces entity by OData protocol
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the GET request
     * @param {Object} payload data which is converted to the JSON string and passed as body of PUT request
     * @param {batch/ChangeSet} changeSet which contains newly created request
     *
     * @returns {batch/Request} instance of batch Request
     *
     * @public
     * @memberof Agent
     */
    public put(...args: any[]): batch;
    /**
     * Create MERGE request in batch. MERGE updates the entity.
     * It is supported by OData protocol 1.0 and 2.0
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the GET request
     * @param {Object} payload data which is converted to the JSON string and passed as body of MERGE request in batch
     * @param {batch/ChangeSet} changeSet which contains newly created request
     *
     * @returns {batch/Request} instance of batch Request
     *
     * @public
     * @memberof Agent
     */
    public merge(...args: any[]): batch;
    /**
     * Create PATCH request in batch. Patch updates the entity.
     * It is supported by OData protocol version 3.0 and later.
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the GET request
     * @param {Object} payload data which is converted to the JSON string and passed as body of MERGE request in batch
     * @param {batch/ChangeSet} changeSet which contains newly created request
     *
     * @returns {batch/Request} instance of batch Request
     *
     * @public
     * @memberof Agent
     */
    public patch(...args: any[]): batch;
    /**
     * Create DELETE request in batch
     *
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the GET request
     * @param {batch/ChangeSet} changeSet which contains newly created request
     *
     * @returns {batch/Request} instance of batch Request
     *
     * @memberof Agent
     */
    delete(inputUrl: string, headers: any, changeSet: any): batch;
    /**
     * Determine boundary from from headers
     *
     * @param {String} batchResponse - content of the response from http batch request
     *
     * @returns {String} instance of batch Request
     *
     * @memberof Batch
     */
    boundaryFromResponse(batchResponse: string): string;
}
import Base = require("./Base");
//# sourceMappingURL=Batch.d.ts.map