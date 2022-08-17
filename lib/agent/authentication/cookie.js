"use strict";

const _ = require("lodash");

/**
 * Try to load service endpoint by cookie authentication
 *
 * @param {Object} settings - normalized OData library settings
 * @param {agent/Agent} agent - instance of superagent HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
function authenticate(settings, agent, endpointUrl) {
  return authenticate
    .setCookiesToAgent(settings, agent, endpointUrl)
    .then(() => agent.fetch(endpointUrl))
    .then(authenticate.processResponse);
}

/**
 * Pass cookies for authentication to agent
 *
 * @param {Object} settings - normalized OData library settings
 * @param {agent/Agent} agent - instance of superagent HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when cookies are set
 */
authenticate.setCookiesToAgent = function (settings, agent, endpointUrl) {
  let promise;
  const cookies = settings.auth.cookies;

  if (_.isArray(cookies)) {
    promise = Promise.all(
      cookies.map(
        (cookie) =>
          new Promise((resolve, reject) => {
            agent.cookieJar.setCookie(
              cookie,
              endpointUrl,
              (err, savedCookie) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(savedCookie);
                }
              }
            );
          })
      )
    );
  } else {
    promise = Promise.reject(new Error("Invalid cookie definition."));
  }

  return promise;
};

/**
 * Check response from service endpoint to determine
 * connection status. Throws for invalid statuses
 *
 * @param {HTTP.Response} response - object with HTTP response info
 *
 * @return {HTTP.Response} the valid response
 */
authenticate.processResponse = function (response) {
  if (response.status > 299) {
    throw new Error(
      `Service rejects authentication with status code ${response.status}`
    );
  } else if (
    !_.isString(response.headers.get("content-type")) ||
    !response.headers.get("content-type").match(/application\/xml/)
  ) {
    throw new Error("Invalid metadata response for Cookie authentification");
  }
  return response;
};

authenticate.authenticatorName = "Cookie";

module.exports = authenticate;
