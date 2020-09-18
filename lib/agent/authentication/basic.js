"use strict";

const _ = require("lodash");

/**
 * Try to load service endpoint with basic authentication
 *
 * @param {Object} settings - normalized OData library settings. contains
 *        user creadentials
 * @param {superagent} superagent - instance of superagent HTTP client
 * @param {String} endpointUrl - url which is used for testing
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
function authenticate(settings, superagent, endpointUrl) {
  return new Promise((resolve, reject) => {
    superagent.auth(
      _.get(settings, "auth.username", ""),
      _.get(settings, "auth.password", ""),
      {
        type: _.get(settings, "auth.type", "") || "auto",
      }
    );
    superagent
      .get(endpointUrl)
      .then((res) => {
        if (authenticate.isValidResponse(res)) {
          resolve();
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
  var headers = response.headers;
  return (
    _.chain(headers)
      .keys()
      .filter(
        (headerName) =>
          headerName.match(/content-type/i) &&
          headers[headerName].match("application/xml")
      )
      .value().length > 0
  );
};

authenticate.authenticatorName = "Basic";

module.exports = authenticate;
