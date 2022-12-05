"use strict";

const responseType = require("./../responseType");

/**
 * Add headers for particular responseType
 *
 * @param {Number} foundResponseType is number defined as constant in
 *        responseType  module
 * @param {RequestDefinition} request object which contains parameters
 *        to generate HTTP request
 */
exports.addHeaders = function (foundResponseType, request) {
  if (foundResponseType !== responseType.ENTITY_VALUE) {
    request.header("Accept", "application/json");
  }
};

/**
 * Append PUT request to batch container
 *
 * @param {agent.batch.Batch} defaultBatch container for HTTP request
 *        definiton based on resource parameter
 * @param {Number} foundResponseType is number defined as constant in
 *        responseType  module
 * @param {EntitySet} resource instance of entitySet definition
 *
 * @return {Promise} promise which is finished when request in batch
 *         is done
 */
exports.batchCall = function (defaultBatch, foundResponseType, resource) {
  const request = resource.defaultRequest;
  const defaultChangeSet = resource.agent.batchManager.defaultChangeSet;
  exports.addHeaders(foundResponseType, request);

  return defaultBatch.put(
    request._path,
    request._headers,
    request._payload,
    defaultChangeSet
  );
};

/**
 * Send PUT request to server
 *
 * @param {EntitySet} resource instance of entitySet definition
 * @param {Number} foundResponseType is number defined as constant in
 *        responseType  module
 * @param {RequestDefinition} request object which contains parameters
 *        to generate HTTP request
 *
 * @return {Promise} promise which is finished when request in batch
 *         is done
 */
exports.agentCall = function (resource, foundResponseType, request) {
  exports.addHeaders(foundResponseType, request);

  return resource.agent.put(
    request._path,
    request._headers,
    foundResponseType === responseType.ENTITY_VALUE
      ? request._payload
      : JSON.stringify(request._payload)
  );
};

/**
 * Create agent call or generate batch request (depends
 * on resource settings)
 *
 * @param {Any} body is content which is send to service
 * @param {EntitySet} resource instance of entitySet definition
 *
 * @return {Promise} promise which is finished when request in batch
 *         is done
 */
exports.call = function (body, resource) {
  let responsePromise;
  const defaultBatch = resource.agent.batchManager.defaultBatch;
  const request = resource.defaultRequest;
  const foundResponseType = responseType.determine(
    resource.defaultRequest,
    resource
  );

  if (foundResponseType === responseType.PROPERTY_VALUE) {
    throw new Error(
      "Can't create PUT request with $value predicate on single property."
    );
  }

  request.calculatePath();

  if (foundResponseType === responseType.ENTITY_VALUE) {
    request.payload(body);
  } else {
    request.payload(resource.bodyProperties(body));
  }

  if (defaultBatch) {
    responsePromise = resource._handleBatchCall(
      exports.batchCall.bind(null, defaultBatch, foundResponseType, resource),
      defaultBatch
    );
  } else {
    responsePromise = resource._handleAgentCall(
      exports.agentCall.bind(null, resource, foundResponseType, request)
    );
  }

  return responsePromise;
};
