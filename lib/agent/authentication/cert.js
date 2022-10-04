"use strict";

const authBasic = require("./basic");

/**
 * Try to load service endpoint with basic authentication
 *
 * @param {Object} settings - normalized OData library settings. contains
 *        user creadentials
 * @param {Agent} agent - instance of superagent HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
function authenticate(settings, agent, endpointUrl) {
  return new Promise((resolve, reject) => {
    agent
      .fetch(endpointUrl)
      .then((res) => {
        if (authBasic.isValidResponse(res)) {
          resolve(res);
        } else {
          let err = new Error("Client certification authentification failed.");
          reject(err);
        }
      })
      .catch(reject);
  });
}

authenticate.authenticatorName = "Certificate";

module.exports = authenticate;
