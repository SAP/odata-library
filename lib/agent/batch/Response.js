"use strict";

const EventEmitter = require("events");
const _ = require("lodash");
const HTTPParser = require("http-parser-js").HTTPParser;
const parsers = require("../parsers");
const Headers = require("./Headers");
const responseType = require("../../engine/responseType");

/**
 * Response class implements OData particular response
 *
 * @public
 * @class Response
 */
class Response extends EventEmitter {
  /**
   * Initialize instance of the batch Response class
   *
   * @param {Array} rawResponse particular response content from whole batch mulitpart/mime response (lines are array items)
   *
   * @public
   * @memberof Response
   */
  constructor(rawResponse) {
    let resolveResponse;
    let rejectResponse;

    super();

    Object.defineProperty(this, "promise", {
      value: new Promise(function (resolve, reject) {
        resolveResponse = resolve;
        rejectResponse = reject;
      }),
      writable: false,
    });

    Object.defineProperty(this, "resolve", {
      value: resolveResponse,
      writable: false,
    });

    Object.defineProperty(this, "reject", {
      value: rejectResponse,
      writable: false,
    });

    this.process(rawResponse);
  }

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
  process(rawResponse) {
    this.body = null;
    _.each(
      this.parseDivideResponse(rawResponse),
      (responseRawValue, responseRawKey) => {
        this[responseRawKey] = responseRawValue;
      }
    );
    let parser = new HTTPParser(HTTPParser.RESPONSE);
    let error;

    try {
      parser.onHeadersComplete = this.handlerHeadersComplete.bind(this);
      parser.onBody = this.handlerBody.bind(this);
      parser.onMessageComplete = this.handlerMessageComplete.bind(this);
      parser.execute(
        Buffer.from(
          _.chain(this.rawHTTPResponse)
            .filter((header) => !header.match(/content-length/i))
            .join("\n")
            .value(),
          "binary"
        )
      );
      parser.finish();
      if (parser.state === "HEADER") {
        this.processHeaderInfo(parser.info);
        this.finishProcessResponse(parser.info.statusCode);
      }
    } catch (ex) {
      error = new Error("Unexpected error thrown for response parsing.");
      error.response = this;
      this.reject(error);
    }

    return parser;
  }

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
  parseDivideResponse(rawResponse) {
    let blocks = _.reduce(
      rawResponse,
      (acc, row) => {
        if (row === "") {
          acc.push([]);
        } else {
          acc[acc.length - 1].push(row);
        }
        return acc;
      },
      [[]]
    );

    return {
      rawHTTPResponse: _.concat(blocks[1], "", blocks[2]),
      rawMIMEHeaders: blocks[0],
    };
  }

  /**
   * Just for compatibility with NodeJS HTTP.Response object
   *
   * @private
   * @memberof Response
   */
  setEncoding() {}

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
  getContentType() {
    let mediaTypeEnd;
    let contentType = _.find(
      this.headers,
      (headerValue, headerName) =>
        _.isString(headerName) && headerName.toLowerCase() === "content-type"
    );
    if (_.isString(contentType)) {
      mediaTypeEnd = contentType.indexOf(";");
      contentType = contentType.substring(
        0,
        mediaTypeEnd < 0 ? contentType.length : mediaTypeEnd
      );
    } else {
      contentType = null;
    }
    return contentType;
  }

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
  getBodyParser() {
    return parsers[this.getContentType()];
  }

  /**
   * Handler which is called after the body parsing is done
   *
   * @param {Error} err is error object raised during body parsing
   * @param {Any} content parsed content
   *
   * @private
   * @memberof Response
   */
  handlerParserFinished(err, content) {
    if (err) {
      this.resolve(err);
    } else {
      this.body = content;
      this.finishProcessResponse(
        this.statusCode,
        JSON.stringify(content, null, 2)
      );
    }
  }

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
  useBodyParser(bodyParser) {
    if (bodyParser) {
      bodyParser(this, this.handlerParserFinished.bind(this));
    } else {
      this.on("end", this.handlerParserFinished.bind(this));
    }
  }

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
  handlerHeadersComplete(headersInfo) {
    this.processHeaderInfo(headersInfo);
    this.useBodyParser(this.getBodyParser());
  }

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
  processHeaderInfo(headersInfo) {
    _.each(headersInfo, (headerInfoValue, headerInfoKey) => {
      this[headerInfoKey] = headerInfoValue;
    });
    this.rawHeaders = this.headers;
    this.headers = new Headers(this.rawHeaders);
  }

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
  handlerBody(data, offset, len) {
    this.emit("data", data.toString("binary", offset, offset + len));
  }

  /**
   * Fire event "end" when response is fully received and parsed
   *
   * @private
   * @memberof Response
   */
  handlerMessageComplete() {
    this.emit("end");
  }

  /**
   * Finish response processing
   *
   * @param {Number} statusCode HTTP status code from raw response
   * @param {String} errorMessage response
   *
   * @private
   * @memberof Response
   */
  finishProcessResponse(statusCode, errorMessage) {
    let message;
    let error;

    if (statusCode < 400) {
      this.resolve(this);
    } else {
      message = `${statusCode} - Invalid response inside Batch.`;
      if (_.isString(errorMessage)) {
        message += `\n${errorMessage}`;
      }
      error = new Error(message);
      error.response = this;
      this.resolve(error);
    }
  }

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
  plain(listResultPath, instanceResultPath) {
    let result;
    switch (this.request.responseType) {
      case responseType.COUNT:
        result = parsers.count(_.get(this, "body"));
        break;
      case responseType.LIST:
        result = _.get(this, `body.${listResultPath}`);
        break;
      case responseType.ENTITY:
        result = _.get(this, `body.${instanceResultPath}`, null);
        break;
    }
    return result || this;
  }

  /**
   * It is mimicry for Fetch API Response json method
   *
   * @returns {Promise} promise resolved by body as json format
   */
  json() {
    return Promise.resolve(this.body);
  }
}

module.exports = Response;
