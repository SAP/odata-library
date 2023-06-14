"use strict";

const Base = require("./Base");
const Request = require("./Request");
const ChangeSet = require("./ChangeSet");
const _ = require("lodash");
const responseType = require("../../engine/responseType");

/**
 * Batch class implements OData batch request and response processing
 *
 * @public
 * @class Batch
 */
class Batch extends Base {
  /**
   * Initialize instance of the Batch class
   *
   * @public
   * @memberof Batch
   */
  constructor() {
    super("requests", "batch");
  }

  /**
   * Add new item to the batch list object
   *
   * @param {String} httpMethod name of the HTTP method
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the post request
   * @param {Object} payload data which is converted to the JSON string and passed as body of POST request in batch
   * @param {ChangeSet} [changeSet] object which defines the changeset which
   *        contains the requests if the parameter is not defined the batch will try
   *        to find the active changeset in the batch automatically
   *
   * @returns {Object} new instance of Request class
   *
   * @private
   * @memberof Batch
   */
  addRequest(httpMethod, inputUrl, headers, payload, changeSet) {
    let request;

    if (changeSet) {
      request = changeSet.addRequest(httpMethod, inputUrl, headers, payload);
    } else {
      request = this.add(Request, httpMethod, inputUrl, headers, payload);
    }
    return request;
  }

  /**
   * Create request in batch with payload
   *
   * @param {String} httpMethod name of the HTTP method
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
   * @param {ChangeSet} changeSet which contains newly created request
   *
   * @returns {Request} instance of batch Request
   *
   * @private
   * @memberof Agent
   */
  addRequestWithPayload(httpMethod, inputUrl, headers, payload, changeSet) {
    return this.addRequest(
      httpMethod,
      inputUrl,
      _.assign(
        {
          "sap-contextid-accept": "header",
          Accept: "application/json",
          DataServiceVersion: "2.0",
          MaxDataServiceVersion: "2.0",
          "Content-Type": "application/json",
          "sap-message-scope": "BusinessObject",
        },
        headers
      ),
      payload,
      changeSet
    );
  }

  /**
   * Try to find passed changeSet in the current batch. If changeSet is not
   * defined and the batch contains only one batch. Use it.
   *
   * @private
   *
   * @param {ChangeSet} [changeSet] object which defines the changeset
   *
   * @returns {ChangeSet} correctly found changeSet from the batch or undefined
   *
   * @memberof Batch
   */
  get defaultChangeSet() {
    let changeSets = _.filter(this.requests, (batchItem) => {
      return batchItem instanceof ChangeSet && !batchItem.commited;
    });

    return changeSets.length > 0 ? changeSets[0] : undefined;
  }

  /**
   *
   * The indexOf method returns the first index at which a given element can be
   * found in the array, or -1 if it is not present.
   *
   * @public
   *
   * @param {ChangeSet|Request} batchItem part of the batch a request or a changeset
   *
   * @returns {Number} index of the batchItem or -1
   *
   * @memberof Batch
   */
  indexOf(batchItem) {
    let requestList = this.requests;
    let index;

    if (batchItem instanceof ChangeSet || batchItem instanceof Request) {
      index = _.findIndex(requestList, (batchItemFromList) => {
        return batchItem === batchItemFromList;
      });
    } else {
      throw new Error("Invalid type of batch item.");
    }

    return index;
  }

  /**
   *
   * Create new changeset
   *
   * @public
   *
   * @returns {ChangeSet} created change set
   *
   * @memberof Batch
   */
  createChangeSet() {
    return this.add(ChangeSet);
  }

  /**
   * Generate multipart/mixed content for the OData batch
   *
   * @param {String} csrfToken passed to create valid particular request in batch payload
   *
   * @returns {String} boundary used by the batch response
   *
   * @private
   * @memberof Batch
   */
  payload(csrfToken) {
    let boundary = `--${this.boundary()}`;
    return _.concat([
      boundary,
      _.map(this.requests, (request) => request.payload(csrfToken)).join(
        `\n${boundary}\n`
      ),
      `${boundary}--`,
    ]).join("\n");
  }

  /**
   * Parse response from OData response and resolve/reject promises of the particular
   * batch requests.
   *
   * @param {String} batchResponse - content of the response from http batch request
   *
   * @returns {Promise} promise which is resolved by the particular responses inside the batch
   *
   * @private
   * @memberof Batch
   */
  process(batchResponse) {
    let promise;
    let promises = [];
    let boundary = this.boundaryFromResponse(batchResponse);
    if (boundary) {
      promise = batchResponse.text().then((batchResponseText) => {
        _.chain(batchResponseText)
          .split("\n")
          .map((row) => row.trim())
          .reduce((acc, row) => {
            if (row === `--${boundary}`) {
              if (acc.length) {
                promises.push(
                  this.requests[acc.length - 1].process(acc[acc.length - 1])
                );
              }
              acc.push([]);
            } else if (row === `--${boundary}--`) {
              if (acc.length) {
                promises.push(
                  this.requests[acc.length - 1].process(acc[acc.length - 1])
                );
              }
            } else {
              acc[acc.length - 1].push(row);
            }
            return acc;
          }, [])
          .value();
        return Promise.all(promises);
      });
    } else {
      promise = Promise.reject(
        new Error('Boundary not found in the "Content-Type" header')
      );
    }
    return promise;
  }

  /**
   * Create GET request in batch
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {ChangeSet} changeSet which contains newly created request
   * @param {Number} useResponseType requested type of response constant defined
   *        in lib/engine/responseType
   *
   * @returns {Request} instance of batch Request
   *
   * @memberof Agent
   */
  get(inputUrl, headers, changeSet, useResponseType) {
    const batchRequest = this.addRequest(
      "GET",
      inputUrl,
      headers,
      undefined,
      changeSet
    );

    batchRequest.responseType = useResponseType;
    return batchRequest;
  }

  /**
   * Create POST request in batch
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
   * @param {ChangeSet} changeSet which contains newly created request
   *
   * @returns {Request} instance of batch Request
   *
   * @public
   * @memberof Agent
   */
  post(...args) {
    const batchRequest = this.addRequestWithPayload("POST", ...args);

    batchRequest.responseType = responseType.ENTITY;
    return batchRequest;
  }

  /**
   * Create PUT request in batch. The PUT request replaces entity by OData protocol
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {Object} payload data which is converted to the JSON string and passed as body of PUT request
   * @param {ChangeSet} changeSet which contains newly created request
   *
   * @returns {Request} instance of batch Request
   *
   * @public
   * @memberof Agent
   */
  put(...args) {
    return this.addRequestWithPayload("PUT", ...args);
  }

  /**
   * Create MERGE request in batch. MERGE updates the entity.
   * It is supported by OData protocol 1.0 and 2.0
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {Object} payload data which is converted to the JSON string and passed as body of MERGE request in batch
   * @param {ChangeSet} changeSet which contains newly created request
   *
   * @returns {Request} instance of batch Request
   *
   * @public
   * @memberof Agent
   */
  merge(...args) {
    return this.addRequestWithPayload("MERGE", ...args);
  }

  /**
   * Create PATCH request in batch. Patch updates the entity.
   * It is supported by OData protocol version 3.0 and later.
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {Object} payload data which is converted to the JSON string and passed as body of MERGE request in batch
   * @param {ChangeSet} changeSet which contains newly created request
   *
   * @returns {Request} instance of batch Request
   *
   * @public
   * @memberof Agent
   */
  patch(...args) {
    return this.addRequestWithPayload("PATCH", ...args);
  }

  /**
   * Create DELETE request in batch
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {ChangeSet} changeSet which contains newly created request
   *
   * @returns {Request} instance of batch Request
   *
   * @memberof Agent
   */
  delete(inputUrl, headers, changeSet) {
    return this.addRequest("DELETE", inputUrl, headers, undefined, changeSet);
  }

  /**
   * Determine boundary from from headers
   *
   * @param {String} batchResponse - content of the response from http batch request
   *
   * @returns {String} instance of batch Request
   *
   * @memberof Batch
   */
  boundaryFromResponse(batchResponse) {
    let boundary;
    let contentType = batchResponse.headers.get("content-type");
    if (_.isString(contentType)) {
      boundary = _.get(
        contentType.match(/^multipart\/mixed; boundary=([^\s]+)/),
        1
      );
    }
    return boundary;
  }
}

module.exports = Batch;
