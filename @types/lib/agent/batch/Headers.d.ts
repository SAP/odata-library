export = Headers;
/**
 * Mimicry of Headers class from WebAPI for Batch responses
 * keep current behavior by dynamic properties
 *
 * @public
 *
 * @class Headers
 */
declare class Headers {
    /**
     * Create instance of Headers
     *
     * @param {Array} rawHeaders array of batch response headers
     *
     * @constructor
     */
    constructor(rawHeaders: any[]);
    headerKeys: any[];
    /**
     * Convert rawHeaders array to instance properties
     * and fill headerKeys map
     *
     * @param {Array} rawHeaders array of batch response headers
     *
     * @private
     */
    private parseHeadersArray;
    /**
     * Returns content of the header by its name
     * the headerName comparation is case-insensitive
     *
     * @param {String} headerName header name to find
     *
     * @returns {String} header content
     *
     * @public
     */
    public get(headerName: string): string;
}
//# sourceMappingURL=Headers.d.ts.map