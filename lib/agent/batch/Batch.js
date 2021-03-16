"use strict";

const Base = require("./Base");
const Request = require("./Request");
const ChangeSet = require("./ChangeSet");
const _ = require("lodash");

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
   * @param {batch/ChangeSet} [changeSet] object which defines the changeset which
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
   * Try to find passed changeSet in the current batch. If changeSet is not
   * defined and the batch contains only one batch. Use it.
   *
   * @private
   *
   * @param {batch/ChangeSet} [changeSet] object which defines the changeset
   *
   * @returns {batch/ChangeSet} correctly found changeSet from the batch or undefined
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
   * @param {batch/ChangeSet|batch/Request} batchItem part of the batch a request or a changeset
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
   * @returns {batch/ChangeSet} created change set
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
    if (batchResponse.boundary) {
      _.chain(batchResponse.body)
        .split("\n")
        .map((row) => row.trim())
        .reduce((acc, row) => {
          if (row === `--${batchResponse.boundary}`) {
            if (acc.length) {
              promises.push(
                this.requests[acc.length - 1].process(acc[acc.length - 1])
              );
            }
            acc.push([]);
          } else if (row === `--${batchResponse.boundary}--`) {
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
      promise = Promise.all(promises);
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
   * @param {batch/ChangeSet} changeSet which contains newly created request
   *
   * @returns {batch/Request} instance of batch Request
   *
   * @memberof Agent
   */
  get(inputUrl, headers, changeSet) {
    return this.addRequest("GET", inputUrl, headers, undefined, changeSet);
  }

  /**
   * Create POST request in batch
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
   * @param {batch/ChangeSet} changeSet which contains newly created request
   *
   * @returns {batch/Request} instance of batch Request
   *
   * @memberof Agent
   */
  post(inputUrl, headers, payload, changeSet) {
    return this.addRequest(
      "POST",
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
   * Create PUT request in batch
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {Object} payload data which is converted to the JSON string and passed as body of PUT request
   * @param {batch/ChangeSet} changeSet which contains newly created request
   *
   * @returns {batch/Request} instance of batch Request
   *
   * @memberof Agent
   */
  put(inputUrl, headers, payload, changeSet) {
    return this.addRequest(
      "PUT",
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
   * Create MERGE request in batch
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {Object} payload data which is converted to the JSON string and passed as body of MERGE request in batch
   * @param {batch/ChangeSet} changeSet which contains newly created request
   *
   * @returns {batch/Request} instance of batch Request
   *
   * @memberof Agent
   */
  merge(inputUrl, headers, payload, changeSet) {
    return this.addRequest(
      "MERGE",
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
   * Create DELETE request in batch
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {batch/ChangeSet} changeSet which contains newly created request
   *
   * @returns {batch/Request} instance of batch Request
   *
   * @memberof Agent
   */
  delete(inputUrl, headers, changeSet) {
    return this.addRequest("DELETE", inputUrl, headers, undefined, changeSet);
  }
}

module.exports = Batch;