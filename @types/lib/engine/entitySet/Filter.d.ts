export = Filter;
/**
 * Class to implement filter handling for OData library client
 *
 * @class Filter
 */
declare class Filter {
    /**
     * Creates an instance of Filter.
     * @param {String} definition of the filter
     * @memberof Filter
     */
    constructor(definition: string);
    /**
     * Check definition of the filter
     *
     * @param {String} definition of the filter
     *
     * @returns {Boolean} returns true if definition is correct
     *
     * @memberof Filter
     */
    check(definition: string): boolean;
    /**
     * Convert filter to the URI Component
     *
     * @returns {String} string which contains filter with encoded characters
     *
     * @memberof Filter
     */
    toURIComponent(): string;
}
//# sourceMappingURL=Filter.d.ts.map