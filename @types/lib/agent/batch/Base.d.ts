export = Base;
/**
 * Base class for batch classes which implements list of other batch objects
 * (batches, changsets, requests)
 *
 * @private
 * @class Base
 */
declare class Base {
    /**
     * Call the method by the <code>super</code>
     *
     * @param {String} listName is the name of the property in the
     *        descendant class which is use as list of batch objects
     * @param {String} boundaryPrefix the boundary prefix for the
     * 		  multipart content of the batch request
     *
     * @public
     * @memberof Base
     */
    constructor(listName: string, boundaryPrefix: string);
    /**
     * Add new item to the batch list object
     *
     * @param {Class} BatchObject class definition for newly created object
     *
     * @returns {Object} create instance of the BatchObject class
     *
     * @private
     * @memberof Base
     */
    private add;
    /**
     * Generate id for the batch object (for batches and changests) which
     * identifies the batch object
     *
     * @returns {String} returns string with 12 hexadecimal numbers
     *
     * @private
     * @memberof Base
     */
    private generateId;
    /**
     * Generate batch boundary for the multipart/mixed content
     *
     * @returns {String} boundary used by the batch response
     *
     * @private
     * @memberof Batch
     */
    private boundary;
}
//# sourceMappingURL=Base.d.ts.map