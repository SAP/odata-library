"use strict";

const _ = require("lodash");

/**
 * Try to load service endpoint without any authentification
 *
 * @param {Object} settings - normalized OData library settings
 * @param {agent/Agent} agent - instance of superagent HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
function authenticate(settings, agent, endpointUrl) {
  return new Promise((resolve, reject) => {
    agent
      .fetch(endpointUrl)
      .then((response) => {
        if (
          response.status === 200 &&
          _.isString(response.headers.get("content-type")) &&
          !!response.headers.get("content-type").match(/application\/xml/)
        ) {
          resolve(response);
        } else {
          let err = new Error(
            "Invalid metadata response for None authentification"
          );
          err.unsupported = true;
          reject(err);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

authenticate.authenticatorName = "None";

module.exports = authenticate;
