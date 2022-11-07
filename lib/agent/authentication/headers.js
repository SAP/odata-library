"use strict";

const _ = require("lodash");
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
  let authorizationHeaders = _.get(settings, "auth.headers", "");
  return new Promise((resolve, reject) => {
    agent
      .fetch(endpointUrl, {
        headers: authorizationHeaders,
      })
      .then((res) => {
        if (authBasic.isValidResponse(res)) {
          agent.setAuthorizationHeaders(authorizationHeaders);
          resolve(res);
        } else {
          let err = new Error("Authentication by headers failed.");
          reject(err);
        }
      })
      .catch(reject);
  });
}

authenticate.authenticatorName = "Headers";

module.exports = authenticate;
