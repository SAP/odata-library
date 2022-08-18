"use strict";

const _ = require("lodash");
const fs = require("fs");
const url = require("./url");

/**
 * Gets username from url of from parameters settings
 *
 * @param {String} urlUsername - string which could contains username
 *
 * @returns {Object} settings username snippet
 */
function parseConnectionStringUsername(urlUsername) {
  var usernameSnippet = {};

  if (_.isString(urlUsername) && urlUsername) {
    usernameSnippet.username = urlUsername;
  } else if (_.isString(process.env.ODATA_USER) && process.env.ODATA_USER) {
    usernameSnippet.username = process.env.ODATA_USER;
  }

  return usernameSnippet;
}

/**
 * Gets username from url of from parameters settings
 *
 * @param {String} urlPassword - string which could contains password in url
 *
 * @returns {Object} settings password snippet
 */
function parseConnectionStringPassword(urlPassword) {
  var passwordSnippet = {};

  if (_.isString(urlPassword) && urlPassword) {
    passwordSnippet.password = urlPassword;
  } else if (
    _.isString(process.env.ODATA_PASSWORD) &&
    process.env.ODATA_PASSWORD
  ) {
    passwordSnippet.password = process.env.ODATA_PASSWORD;
  }

  return passwordSnippet;
}

/**
 * Try to get metadata parameters from environment variable
 *
 * @returns {Object} settings parameters snippet
 */
function parseConnectionParameters() {
  var metadataParametersSnippet = {};

  if (
    _.isString(process.env.ODATA_PARAMETERS) &&
    process.env.ODATA_PARAMETERS
  ) {
    try {
      metadataParametersSnippet.parameters = JSON.parse(
        process.env.ODATA_PARAMETERS
      );
    } catch (err) {
      throw Error("ODATA_PARAMETERS variable is not valid JSON.");
    }
  }
  return metadataParametersSnippet;
}

/**
 * Try to get metadata parameters from environment variable
 *
 * @param {String} connectionUrl - string which could contains corrently defined url
 * @param {Object} parameters - reference to parameter structure which is updated by method
 *
 * @return {Object} returns structure defining OData endpoint
 */
function parseConnectionString(connectionUrl, parameters) {
  var authSnippet = _.assign(
    {},
    parseConnectionStringPassword(url.password(connectionUrl)),
    parseConnectionStringUsername(url.username(connectionUrl))
  );

  return _.assign(
    parameters,
    {
      url: url.base(connectionUrl),
    },
    _.keys(authSnippet).length
      ? {
          auth: authSnippet,
        }
      : {},
    parseConnectionParameters()
  );
}

/**
 * Try to get connection settings parameters from the passed object
 *
 * @param {Object} connectionSettings - object which should contain connection settings
 * @param {Object} parameters - reference to parameter structure which is updated by method
 */
function parseConnectionSettings(connectionSettings, parameters) {
  if (_.isObject(connectionSettings.auth)) {
    parameters.auth = connectionSettings.auth;
  }

  if (_.isPlainObject(connectionSettings.parameters)) {
    parameters.parameters = _.assign(
      parameters.parameters,
      connectionSettings.parameters
    );
  }

  if (_.isObject(connectionSettings.logger)) {
    parameters.logger = connectionSettings.logger;
  }

  if (_.isString(connectionSettings.annotationsUrl)) {
    parameters.annotationsUrl = connectionSettings.annotationsUrl;
  }
}

/**
 * Try to get all needed url parameters from the passed object
 *
 * @param {Object} connectionSettings - string which could contains corrently defined url
 * @param {Object} parameters - reference to parameter structure which is updated by method
 *
 * @return {Object} returns structure defining OData endpoint
 */
function parseConnectionObject(connectionSettings, parameters) {
  if (!_.isString(connectionSettings.url)) {
    throw new Error("URL is missing in connection settings.");
  }

  parseConnectionString(connectionSettings.url, parameters);
  parseConnectionSettings(connectionSettings, parameters);

  return parameters;
}

/**
 * Try to get certificate used for connection to the odata service
 *
 * @param {Object} connectionSettings - string which could contains corrently defined url
 * @param {Object} parameters - reference to parameter structure which is updated by method
 *
 * @return {Object} returns structure defining OData endpoint
 */
function parseCa(connectionSettings, parameters) {
  var caCertPath;

  if (_.isString(connectionSettings.caCertPath)) {
    caCertPath = connectionSettings.caCertPath;
  } else if (_.isString(process.env.ODATA_CA_CERT_PATH)) {
    caCertPath = process.env.ODATA_CA_CERT_PATH;
  }

  if (caCertPath) {
    parameters.ca = fs.readFileSync(caCertPath);
  }

  return parameters;
}

/**
 * Parse connection settings passed to the client object
 *
 * @param {String|Object} connectionSettings - url or object with url and auth settings
 *
 * @return {Object} structure used by the client to connect the server
 */
function parseSettings(connectionSettings = process.env.ODATA_URL) {
  var parameters = {
    url: null,
    strict:
      !_.isBoolean(connectionSettings.strict) || connectionSettings.strict,
  };

  if (_.isString(connectionSettings) && connectionSettings) {
    parameters = parseConnectionString(connectionSettings, parameters);
  } else if (_.isObject(connectionSettings)) {
    parameters = parseConnectionObject(
      _.assign(
        {
          url: process.env.ODATA_URL,
        },
        connectionSettings
      ),
      parameters
    );
  } else {
    throw new Error("Invalid OData service connection settings");
  }

  parameters = parseCa(connectionSettings, parameters);
  parameters = parseSettings._.parseConnectionCookie(
    connectionSettings,
    parameters
  );

  return parameters;
}

parseSettings._ = {};

/**
 * Try to get cookies from environment variable
 *
 * @param {Object} connectionSettings - object which could contains corrently defined url
 * @param {Object} parameters - reference to parameter structure which is updated by method
 *
 * @return {Object} returns structure defining OData endpoint
 */
parseSettings._.parseConnectionCookie = function parseConnectionCookie(
  connectionSettings,
  parameters
) {
  let cookies;

  if (!parseSettings._.checkCookieSettings(connectionSettings)) {
    throw new Error("Invalid cookie definition");
  }

  if (_.has(connectionSettings, "auth.cookies")) {
    _.set(parameters, "auth.cookies", connectionSettings.auth.cookies);
    _.set(parameters, "auth.type", "cookie");
  } else if (process.env.ODATA_COOKIE) {
    try {
      cookies = JSON.parse(process.env.ODATA_COOKIE);
    } catch (err) {
      cookies = [process.env.ODATA_COOKIE];
    }
    _.set(parameters, "auth.cookies", cookies);
    _.set(parameters, "auth.type", "cookie");
  }

  return parameters;
};

parseSettings._.checkCookieSettings = function (connectionSettings) {
  let check = true;

  if (_.has(connectionSettings, "auth.cookies")) {
    check =
      _.isArray(connectionSettings.auth.cookies) &&
      connectionSettings.auth.cookies.every((cookie) => _.isString(cookie));
  } else if (_.has(process.env, "ODATA_COOKIE")) {
    try {
      let cookieToCheck = JSON.parse(process.env.ODATA_COOKIE);
      check = _.isArray(cookieToCheck);
    } catch (err) {
      check = _.isString(process.env.ODATA_COOKIE);
    }
  }

  return check;
};

module.exports = parseSettings;
