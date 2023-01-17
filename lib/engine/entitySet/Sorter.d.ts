export = Sorter;
/**
 * Class to implement sort handling for OData library client.
 *
 * @class Sorter
 */
declare class Sorter {
    /**
     * Creates an instance of Sorter.
     * @param {Object} entityType information about EntityType parsed from Metadata
     * @param {string} parts parts of the orderby clause
     * @memberof Sorter
     */
    constructor(entityType: any, parts: string);
    /**
     * Validates the input
     *
     * Checks if all properties are Sortable
     *
     * @param {Object} entityType information about EntityType parsed from Metadata
     * @param {string} parts parts of the orderby clause
     */
    validate(entityType: any, parts: string): void;
    /**
     * Convert sorter to the URI Component
     *
     * @returns {String} string which contains sorter with encoded characters
     */
    toURIComponent(): string;
}
//# sourceMappingURL=Sorter.d.ts.map