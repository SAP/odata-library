"use strict";

const Resource = require("./Resource");
const _ = require("lodash");

/**
 * Javascript class which implements common functionality for Action
 * and Function classes.
 *
 * @class BoundableResource
 * @extends {Resource}
 */
class BoundableResource extends Resource {
  /**
   * Creates an instance of <code>BoundableResource</code>.
   * @param {Agent} agent instance of the Agent class @see Agent.js
   * @param {Object} metadata information about BoundableResource from Metadata
   * @memberof BoundableResource
   */
  constructor(agent, metadata) {
    super(agent, {
      _parameters: {},
    });

    Object.defineProperty(this, "meta", {
      value: metadata,
      writable: false,
    });
  }

  /**
   * Normalize response and returns raw response or object or array
   *
   * @param {IncomingMessage} rawResponse from HTTP client
   * @param {Boolean} raw force to use raw response
   *
   * @returns {Object|Array} raw response object or object or results array
   *
   * @memberof BoundableResource
   */
  normalizeResponse(rawResponse, raw) {
    let promise = Promise.resolve(rawResponse);
    let contentType;

    if (!raw) {
      contentType = rawResponse.headers.get("content-type");
      if (_.isString(contentType) && contentType.match(/application\/json/)) {
        promise = rawResponse.json().then((json) => {
          let result = json;
          if (_.isArray(_.get(json, this.agent._listResultPath))) {
            result = _.get(json, this.agent._listResultPath);
          } else if (_.has(json, this.agent._instanceResultPath)) {
            result = _.get(json, this.agent._instanceResultPath);
          }
          return result;
        });
      }
    }
    return promise;
  }
}

module.exports = BoundableResource;
