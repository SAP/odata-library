"use strict";

const _ = require("lodash");

/**
 * Send informations about response and  request to the logger
 *
 * @param {Object} logger instance of class which implements log functions
 * @param {Number} counter sequence number of current HTTP request/response
 * @param {String} requestUrl endpoint which send response
 * @param {Object} opts options passed to fetch
 * @param {Object} res response from the HTTP server
 *
 * @memberof Agent
 */
module.exports.logResponse = function (logger, counter, requestUrl, opts, res) {
  logger.debug(
    `Response #${counter}\t${
      opts.method || "GET"
    }\t${requestUrl}\t${JSON.stringify(
      _.pickBy(
        res,
        (value, key) =>
          _.isString(key) &&
          _.find([/status/, /headers/], (regex) => key.match(regex))
      )
    )}`
  );
};

/**
 * Send informations about request to the logger
 *
 * @param {Object} logger instance of class which implements log functions
 * @param {Number} counter sequence number of current HTTP request/response
 * @param {String} requestUrl endpoint which send response
 * @param {Object} opts options passed to fetch
 *
 * @memberof Agent
 */
module.exports.logRequest = function (logger, counter, requestUrl, opts) {
  logger.debug(
    `Request #${counter}\t${
      opts.method || "GET"
    }\t${requestUrl}\t${JSON.stringify(
      _.pickBy(opts, (value, key) => {
        return key !== "method";
      })
    )}`
  );
};
