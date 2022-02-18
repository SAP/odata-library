"use strict";

const _ = require("lodash");

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
  let username = _.get(settings, "auth.username", "");
  let password = _.get(settings, "auth.password", "");
  let authorization =
    "Basic " + Buffer.from(username + ":" + password).toString("base64");
  let authorizationHeaders = {
    Authorization: authorization,
  };
  return new Promise((resolve, reject) => {
    agent
      .fetch(endpointUrl, {
        headers: authorizationHeaders,
      })
      .then((res) => {
        if (authenticate.isValidResponse(res)) {
          agent.setAuthorizationHeaders(authorizationHeaders);
          resolve(res);
        } else {
          let err = new Error(
            "OData server does not support basic authentification."
          );
          err.unsupported = true;
          reject(err);
        }
      })
      .catch(reject);
  });
}

authenticate.isValidResponse = function (response) {
  return (
    response.status === 200 &&
    _.isString(response.headers.get("content-type")) &&
    !!response.headers.get("content-type").match(/application\/xml/)
  );
};

authenticate.authenticatorName = "Basic";

module.exports = authenticate;
