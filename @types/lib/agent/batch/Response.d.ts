export = Response;
/**
 * Response class implements OData particular response
 *
 * @public
 * @class Response
 */
declare class Response extends EventEmitter<[never]> {
    /**
     * Initialize instance of the batch Response class
     *
     * @param {Array} rawResponse particular response content from whole batch mulitpart/mime response (lines are array items)
     *
     * @public
     * @memberof Response
     */
    constructor(rawResponse: any[]);
    /**
     * Parse and resolve/reject Response.promise
     *
     * @param {Array} rawResponse particular response content from whole batch mulitpart/mime response (lines are array items)
     *
     * @returns {Object} initialized parser (for testing usage)
     *
     * @private
     * @memberof Response
     */
    private process;
    body: any;
    /**
     * Divide rawResponse to part for MIME content and part of HTTP content
     *
     * @param {Array} rawResponse particular response content from whole batch mulitpart/mime response (lines are array items)
     *
     * @returns {Object} object with "rawHTTPResponse" key and "rawMIMEHeaders" key
     *
     * @private
     * @memberof Response
     */
    private parseDivideResponse;
    /**
     * Just for compatibility with NodeJS HTTP.Response object
     *
     * @private
     * @memberof Response
     */
    private setEncoding;
    /**
     * Divide rawResponse to part for MIME content and part of HTTP content
     *
     * @returns {String} content type of the particular batch HTTP response
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
     *
     * @private
     * @memberof Response
     */
    private getContentType;
    /**
     * Determine parser for the current response
     *
     * @returns {Function} function which is compatible with superagent parser
     *
     * @see http://visionmedia.github.io/superagent/#parsing-response-bodies
     *
     * @private
     * @memberof Response
     */
    private getBodyParser;
    /**
     * Handler which is called after the body parsing is done
     *
     * @param {Error} err is error object raised during body parsing
     * @param {Any} content parsed content
     *
     * @private
     * @memberof Response
     */
    private handlerParserFinished;
    /**
     * Helper function which sets correct parser after the headers are
     * loaded and parsed
     *
     * Use by handlerHeadersComplete method
     *
     * @param {Function} bodyParser is function function which is compatible with superagent parser
     *
     * @see http://visionmedia.github.io/superagent/#parsing-response-bodies
     *
     * @private
     * @memberof Response
     */
    private useBodyParser;
    /**
     * Handler called when headers are received. Parse headers and set correct body
     * parser.
     *
     * @param {Object} headersInfo object with "headers" key which contains array
     *        of headers. The headers are set as rawHeaders to the Response object
     *        parsed headers are accessible as headers object
     *
     * @see http://visionmedia.github.io/superagent/#parsing-response-bodies
     *
     * @private
     * @memberof Response
     */
    private handlerHeadersComplete;
    /**
     * Append parsed headers to the batch response instance
     *
     * @param {Object} headersInfo object with "headers" key which contains array
     *        of headers. The headers are set as rawHeaders to the Response object
     *        parsed headers are accessible as headers object
     *
     * @see http://visionmedia.github.io/superagent/#parsing-response-bodies
     *
     * @private
     * @memberof Response
     */
    private processHeaderInfo;
    rawHeaders: any;
    headers: any;
    /**
     * Fire event "data" after the new data are recevied
     *
     * @param {Buffer} data buffet with body of the HTTP response
     * @param {Number} offset offset of currently received data
     * @param {Number} len length of currently received data
     *
     * @private
     * @memberof Response
     */
    private handlerBody;
    /**
     * Fire event "end" when response is fully received and parsed
     *
     * @private
     * @memberof Response
     */
    private handlerMessageComplete;
    /**
     * Finish response processing
     *
     * @param {Number} statusCode HTTP status code from raw response
     * @param {String} errorMessage response
     *
     * @private
     * @memberof Response
     */
    private finishProcessResponse;
    /**
     * Read plain OData response as javascript object from
     * Batch response
     *
     * @public
     *
     * @param {String} listResultPath path to list result (depends on OData version)
     * @param {String} instanceResultPath path to entity result (depends on OData version)
     *
     * @returns {Array|Object} parsed list or entity
     *
     * @memberof agent/batch/Response
     */
    public plain(listResultPath: string, instanceResultPath: string): any[] | any;
    /**
     * It is mimicry for Fetch API Response json method
     *
     * @returns {Promise} promise resolved by body as json format
     */
    json(): Promise<any>;
}
import EventEmitter = require("events");
//# sourceMappingURL=Response.d.ts.map