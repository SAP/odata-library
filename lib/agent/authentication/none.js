"use strict";

/**
 * Try to load service endpoint without any authentification
 *
 * @param {Object} settings - normalized OData library settings
 * @param {superagent} superagent - instance of superagent HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
function authenticate(settings, superagent, endpointUrl) {
  return new Promise((resolve, reject) => {
    superagent
      .get(endpointUrl)
      .then((response) => {
        if (
          response.statusCode === 200 &&
          !!response.headers["content-type"].match(/application\/xml/)
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
