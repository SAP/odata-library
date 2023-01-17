export = Collection;
/**
 * Envelops an collection. (OASIS-CSDL)
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Collection
 * (https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/ecc942a0-af88-4012-be6f-439c706641d4)
 *
 * @class Collection
 * @extends {Array}
 */
declare class Collection extends Array<any> {
    /**
     * Creates an instance of Collection.
     * @param {Object} rawMetadata raw metadata object for the collection
     * @param {Object} expressionBuilder expression builder for creating value objects
     * @memberof Collection
     */
    constructor(rawMetadata: any, expressionBuilder: any);
}
//# sourceMappingURL=Collection.d.ts.map