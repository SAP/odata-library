"use strict";

const _ = require("lodash");

/**
 * Mimicry of Headers class from WebAPI for Batch responses
 * keep current behavior by dynamic properties
 *
 * @public
 *
 * @class Headers
 */
class Headers {
  /**
   * Create instance of Headers
   *
   * @param {Array} rawHeaders array of batch response headers
   *
   * @constructor
   */
  constructor(rawHeaders) {
    this.headerKeys = [];
    this.parseHeadersArray(rawHeaders);
  }

  /**
   * Convert rawHeaders array to instance properties
   * and fill headerKeys map
   *
   * @param {Array} rawHeaders array of batch response headers
   *
   * @private
   */
  parseHeadersArray(rawHeaders) {
    _.each(rawHeaders, (headerValue, index) => {
      let headerKey;
      if (index % 2) {
        headerKey = rawHeaders[index - 1];
        this[headerKey] = headerValue;
        this.headerKeys.push(headerKey);
      }
    });
  }

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
  get(headerName) {
    const normalizedKey = _.find(
      this.headerKeys,
      (headerKey) =>
        _.isString(headerName) &&
        _.isString(headerKey) &&
        headerName.toLowerCase() === headerKey.toLowerCase()
    );
    return this[normalizedKey];
  }
}

module.exports = Headers;
