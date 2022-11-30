"use strict";

const responseType = require("./../responseType");

exports.calculate = {};

/**
 * Calculate path for request to list count
 *
 * @param {RequestDefinition} request object which contains parameters to generate HTTP request
 *
 * @returns {String} calculated path
 */
exports.calculate[responseType.COUNT] = function (request) {
  return `/${request._resource.getListResourcePath()}/\$count?${request._resource.urlQuery()}`;
};

/**
 * Calculate path for request to list
 *
 * @param {RequestDefinition} request object which contains parameters to generate HTTP request
 *
 * @returns {String} calculated path
 */
exports.calculate[responseType.LIST] = function (request) {
  const urlQuery = request._resource.urlQuery({
    $top: 100,
    $skip: 0,
    $format: "json",
  });
  return `/${request._resource.getListResourcePath()}?${urlQuery}`;
};

/**
 * Calculate path for request to raw entity content
 *
 * @param {RequestDefinition} request object which contains parameters to generate HTTP request
 *
 * @returns {String} calculated path
 */
exports.calculate[responseType.ENTITY_VALUE] = function (request) {
  return `/${request._resource.getSingleResourcePath()}/\$value`;
};

/**
 * Calculate path for request to raw property content
 *
 * @param {RequestDefinition} request object which contains parameters to generate HTTP request
 *
 * @returns {String} calculated path
 */
exports.calculate[responseType.PROPERTY_VALUE] = function (request) {
  return `/${request._resource.getSingleResourcePath()}/${
    request._valuePropertyName
  }/\$value`;
};

/**
 * Calculate path for request to endpoint which is not particulary specified
 *
 * @param {RequestDefinition} request object which contains parameters to generate HTTP request
 *
 * @returns {String} calculated path
 */
exports.default = function (request) {
  const urlQuery = request._resource.urlQuery({
    $format: "json",
  });
  return `/${request._resource.getSingleResourcePath()}?${urlQuery}`;
};
