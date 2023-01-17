export = ChangeSet;
declare class ChangeSet extends Base {
    constructor();
    commited: boolean;
    /**
     * Add new item to the batch list object
     *
     * @param {String} httpMethod name of the HTTP method
     * @param {String} inputUrl relative path in the service
     * @param {Object} headers object which contains headers used for the post request
     * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
     *
     * @returns {Object} new instance of Request class
     *
     * @private
     * @memberof ChangeSet
     */
    private addRequest;
    /**
     * Generate HTTP request which is part of thh multipart/mixed content for the OData batch
     *
     * @param {String} csrfToken passed to request headers
     *
     * @returns {String} changeset converted to the string
     *
     * @private
     * @memberof ChangeSet
     */
    private payload;
    /**
     * Parse response from OData response and resolve/reject promises of the particular
     * changeset requests.
     *
     * @param {String} changeSetResponse - content of the changeset from http batch request
     *
     * @returns {Promise} promise which is resolved by the particular responses inside the changeset
     *
     * @private
     * @memberof ChangeSet
     */
    private process;
    /**
     * Mark changeset as committed
     *
     * @public
     * @memberof ChangeSet
     */
    public commit(): void;
}
import Base = require("./Base");
//# sourceMappingURL=ChangeSet.d.ts.map