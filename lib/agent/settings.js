"use strict";

const _ = require("lodash");
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

  parameters = parseSettings._.parseConnectionCookie(
    connectionSettings,
    parameters
  );

  parameters = parseSettings._.parseTLSDefinitions(
    parseSettings.AUTH.CERT,
    connectionSettings,
    process.env,
    parameters
  );

  parameters = parseSettings._.parseHeadersDefinitions(
    connectionSettings,
    process.env,
    parameters
  );

  return parameters;
}

parseSettings._ = {};

/**
 * Try to get authentication headers from constructor settings and environment variable
 *
 * @param {Object} connectionSettings - object which could contains corrently defined url
 * @param {Object} environmentVariables - map of environment variables
 * @param {Object} parameters - reference to parameter structure which is updated by method
 *
 * @return {Object} returns structure defining OData endpoint
 */
parseSettings._.parseHeadersDefinitions = function (
  connectionSettings,
  environmentVariables,
  parameters
) {
  const isValidHeadersSettings = parseSettings._.checkHeadersSettings(
    connectionSettings,
    environmentVariables
  );

  if (isValidHeadersSettings === false) {
    throw new Error("Invalid settings for headers authentication");
  }

  if (isValidHeadersSettings === true) {
    if (_.has(connectionSettings, "auth.headers")) {
      _.set(parameters, "auth.headers", connectionSettings.auth.headers);
      _.set(parameters, "auth.type", "headers");
    } else if (environmentVariables.ODATA_HEADERS) {
      _.set(
        parameters,
        "auth.headers",
        JSON.parse(environmentVariables.ODATA_HEADERS)
      );
      _.set(parameters, "auth.type", "headers");
    }
  }

  return parameters;
};

/**
 * Check if authentication headers settings is correct
 *
 * @param {Object} connectionSettings - object which could contains corrently defined url
 * @param {Object} environmentVariables - map of environment variables
 *
 * @return {Object} returns structure defining OData endpoint
 */
parseSettings._.checkHeadersSettings = function (
  connectionSettings,
  environmentVariables
) {
  let check = null;

  if (_.has(connectionSettings, "auth.headers")) {
    check = _.isObject(connectionSettings.auth.headers);
  } else if (_.has(environmentVariables, "ODATA_HEADERS")) {
    try {
      check = _.isObject(JSON.parse(environmentVariables.ODATA_HEADERS));
    } catch (err) {
      check = false;
    }
  }

  return check;
};

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

  if (parseSettings._.checkCookieSettings(connectionSettings) === false) {
    throw new Error("Invalid authenticate cookie settings");
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

/**
 * Check if cookie settings is correct
 *
 * @param {Object} connectionSettings - object which could contains corrently defined url
 *
 * @return {Object} returns structure defining OData endpoint
 */
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

parseSettings.AUTH = {
  CERT: {
    PEM_OBJECT_KEYS: {
      ORDER: 1,
      SOURCE: "SETTINGS",
      MANDATORY_KEYS: ["auth.cert", "auth.key"],
      OPTIONAL_KEYS: ["auth.ca"],
      ADDITIONAL_KEYS: {
        "auth.type": "cert",
      },
    },
    PFX_OBJECT_KEYS: {
      ORDER: 2,
      SOURCE: "SETTINGS",
      MANDATORY_KEYS: ["auth.pfx", "auth.passphrase"],
      OPTIONAL_KEYS: ["auth.ca"],
      ADDITIONAL_KEYS: {
        "auth.type": "cert",
      },
    },
    PEM_ENVIRONMENT_KEYS: {
      ORDER: 3,
      SOURCE: "ENV",
      MANDATORY_KEYS: ["ODATA_CLIENT_CERT", "ODATA_CLIENT_KEY"],
      OPTIONAL_KEYS: ["ODATA_EXTRA_CA"],
      CONVERSION: {
        ODATA_CLIENT_CERT: "auth.cert",
        ODATA_CLIENT_KEY: "auth.key",
        ODATA_EXTRA_CA: "auth.ca",
      },
      ADDITIONAL_KEYS: {
        "auth.type": "cert",
      },
    },
    CA_OBJECT_KEYS: {
      ORDER: 4,
      SOURCE: "SETTINGS",
      MANDATORY_KEYS: ["auth.ca"],
      OPTIONAL_KEYS: [],
    },
    CA_ENVIRONMENT_KEYS: {
      ORDER: 5,
      SOURCE: "ENV",
      MANDATORY_KEYS: ["ODATA_EXTRA_CA"],
      OPTIONAL_KEYS: [],
      CONVERSION: { ODATA_EXTRA_CA: "auth.ca" },
    },
  },
};

/**
 * Determine type of template from AUTH.CERT for
 * checking and parsing TLS definitions
 *
 * @param {Array} templateDefinitions - list of templates for TLS definitionis (coming from AUTH.CERT)
 * @param {Object} connectionSettings - object which could contains corrently defined url
 * @param {Object} processEnv - map of environment variables
 *
 * @return {Object} template TLS settings
 */
parseSettings._.determineTLSDefinition = function (
  templateDefinitions,
  connectionSettings,
  processEnv
) {
  return _.map(templateDefinitions, (def, key) =>
    _.assign(
      {
        key: key,
        source: def.SOURCE === "ENV" ? processEnv : connectionSettings,
      },
      def
    )
  )
    .sort((defA, defB) => defA.ORDER - defB.ORDER)
    .find((def) => def.MANDATORY_KEYS.some((key) => _.has(def.source, key)));
};

/**
 * Check current TLS settings by template
 *
 * @param {Array} definition - list of templates for TLS definitionis (coming from AUTH.CERT)
 * @param {Object} connectionSettings - object which could contains corrently defined url
 * @param {Object} processEnv - map of environment variables
 * @param {Object} parameters - parsed settings
 *
 * @return {Error} error description
 */
parseSettings._.checkTLSDefinition = function (
  definition,
  connectionSettings,
  processEnv,
  parameters
) {
  let error;

  if (definition) {
    if (!(_.get(parameters, "url") || "").match(/^https/)) {
      error = new Error("Use SSL parameters with HTTPS only.");
    } else {
      const missingKeys = definition.MANDATORY_KEYS.filter(
        (mandatoryKey) => !_.has(definition.source, mandatoryKey)
      );
      if (missingKeys.length > 0) {
        error = new Error(`Missing certificate parameter ${missingKeys[0]}.`);
      }
    }
  }

  return error;
};

/**
 * Parse TLS settings
 *
 * @param {Array} templateDefinitions - list of templates for TLS definitionis (coming from AUTH.CERT)
 * @param {Object} connectionSettings - object which could contains corrently defined url
 * @param {Object} processEnv - map of environment variables
 * @param {Object} parameters - parsed settings
 *
 * @return {Object} parameters with TLS settings
 */
parseSettings._.parseTLSDefinitions = function (
  templateDefinitions,
  connectionSettings,
  processEnv,
  parameters
) {
  const definition = parseSettings._.determineTLSDefinition(
    templateDefinitions,
    connectionSettings,
    processEnv
  );

  const err = parseSettings._.checkTLSDefinition(
    definition,
    connectionSettings,
    processEnv,
    parameters
  );

  if (err) {
    throw err;
  } else if (definition) {
    _.concat([], definition.MANDATORY_KEYS, definition.OPTIONAL_KEYS)
      .filter((path) => _.has(definition.source, path))
      .forEach((sourcePath) => {
        const destinationPath = _.has(definition, "CONVERSION." + sourcePath)
          ? definition.CONVERSION[sourcePath]
          : sourcePath;
        _.set(
          parameters,
          destinationPath,
          _.get(definition.source, sourcePath)
        );
      });
    _.each(definition.ADDITIONAL_KEYS, (value, path) =>
      _.set(parameters, path, value)
    );
  }

  return parameters;
};

module.exports = parseSettings;
