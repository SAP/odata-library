export = Manager;
/**
 * The class manages the batches defined by the OData client
 *
 * @see http://docs.oasis-open.org/odata/odata/v4.01/cs01/part1-protocol/odata-v4.01-cs01-part1-protocol.html#_Toc505771274
 *
 * @class Manager
 */
declare class Manager extends Base {
    /**
     * Creates an instance of <code>Manager</code>.
     *
     * @memberof Manager
     */
    constructor();
    /**
     * Add new batch object to the list of the batches
     *
     * @return {Object} newly created the batch object which represents future batch request
     *
     * @public
     * @memberof Manager
     */
    public add(): any;
    /**
     * Remove batch from the currently registered batch objects
     *
     * @param {Object} batch object for remove
     *
     * @return {Object} removed batch object
     *
     * @private
     * @memberof Manager
     */
    private remove;
    /**
     * Check existency of passed batch in registered batches
     *
     * @param {Object} batch to check
     *
     * @return {Boolean} true if batch object exists
     *
     * @public
     * @memberof Manager
     */
    public has(batch: any): boolean;
    /**
     * Find index of batch passed as parameter. Raise error if batch is not
     * Batch type
     *
     * @param {Batch} batch to find
     *
     * @return {Number} index of the found batch or -1 if does not exists
     *
     * @public
     * @memberof Manager
     */
    public indexOf(batch: Batch): number;
    get defaultBatch(): any;
    get defaultChangeSet(): any;
}
import Base = require("./Base");
import Batch = require("./Batch");
//# sourceMappingURL=Manager.d.ts.map