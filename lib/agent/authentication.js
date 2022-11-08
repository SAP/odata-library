"use strict";

const _ = require("lodash");

exports.AUTHENTICATORS = {
  basic: require("./authentication/basic"),
  none: require("./authentication/none"),
  samlSap: require("./authentication/samlSap"),
  cookie: require("./authentication/cookie"),
  cert: require("./authentication/cert"),
  headers: require("./authentication/headers"),
};

exports.AUTHENTICATORS_AUTO_ORDER = [
  exports.AUTHENTICATORS.samlSap,
  exports.AUTHENTICATORS.basic,
  exports.AUTHENTICATORS.none,
];

/**
 * Authenticate user by different ways defined
 * by settings
 *
 * @param {Agent} agent instance of agent/Agent class which
 *        is authorized
 * @param {String} endpointUrl url of metadata, which is used as
 *        root of service
 *
 * @return {Promise} promise which is resolve when first authenticator succeed
 *        or reject if all authenticators fails
 *
 * @public
 */
exports.authenticate = function (agent, endpointUrl) {
  let promise;

  if (_.has(agent, "settings.auth.type")) {
    const authenticator = exports.AUTHENTICATORS[agent.settings.auth.type];
    if (authenticator) {
      promise = authenticator(agent.settings, agent, endpointUrl);
    } else {
      promise = Promise.reject(
        new Error(`Missing authenticator type ${agent.settings.auth.type}`)
      );
    }
  } else {
    promise = exports.authenticateAuto(agent, endpointUrl);
  }

  return promise;
};

/**
 * Authenticate user by authenticators. Authenticators are modules
 * in lib/agent/authentication/. List of modules is in Agent.authenticators
 * array. Authenticate method calls authenticators in order of list.
 * User is authenticated when first authenticator succeed.
 *
 * @param {Agent} agent instance of agent/Agent class which
 *        is authorized
 * @param {String} endpointUrl url of metadata, which is used as
 *        root of service
 *
 * @return {Promise} promise which is resolve when first authenticator succeed
 *        or reject if all authenticators fails
 *
 * @public
 */
exports.authenticateAuto = function (agent, endpointUrl) {
  return new Promise((resolve, reject) => {
    let authenticator;
    if (
      _.isArray(exports.AUTHENTICATORS_AUTO_ORDER) &&
      exports.AUTHENTICATORS_AUTO_ORDER.length > 0
    ) {
      authenticator = exports.AUTHENTICATORS_AUTO_ORDER[0];
      agent.logger.debug(
        `Try to authenticate over ${authenticator.authenticatorName} authenticator.`
      );
      exports.tryAuthenticator(1, endpointUrl, {
        authentcatePromise: authenticator(agent.settings, agent, endpointUrl),
        success: resolve,
        error: reject,
        agent: agent,
      });
    } else {
      reject(new Error("Authenticators are not defined."));
    }
  });
};

/**
 * Try authenticate user by particular authenticator. If authenticator
 * fails try to use next authenticator from Agent.authenticators list.
 * If all authenticators fails call callBackError parameter if any
 * authenticator succeed call callBack parameter
 *
 * The method is used internally in the public authenticated method
 *
 * @private
 *
 * @param {Number} index to the Agent.authenticators which is used
 * @param {String} endpointUrl url of metadata, which is used as
 *        root of service
 * @param {Object} init map with additonal parameters
 *        authentcatePromise - previous authenticator promise
 *                 determine previous authenticator result
 *        success - function which is called when authenticator
 *                 succeed
 *        error - function which is called when all authenticators
 *                 fails
 * @private
 */
exports.tryAuthenticator = function (index, endpointUrl, init) {
  let previousAuthenticator;
  let authenticator;

  const previousAuthenticatorPromise = init.authentcatePromise;
  const callBack = init.success;
  const callBackError = init.error;
  const agent = init.agent;

  previousAuthenticator = exports.AUTHENTICATORS_AUTO_ORDER[index - 1];
  previousAuthenticatorPromise
    .then((response) => {
      agent.logger.debug(
        `Authenticator ${previousAuthenticator.authenticatorName} succeed.`
      );
      callBack(response);
    })
    .catch((err) => {
      let fatalError = exports.fatalAuthenticateError(
        err,
        previousAuthenticator
      );
      if (fatalError) {
        callBackError(fatalError);
      } else {
        agent.logger.warn(
          `Authenticator ${previousAuthenticator.authenticatorName} failed.`,
          err
        );
        if (index < exports.AUTHENTICATORS_AUTO_ORDER.length) {
          authenticator = exports.AUTHENTICATORS_AUTO_ORDER[index];
          agent.logger.debug(
            `Try to authenticate over ${authenticator.authenticatorName} authenticator.`
          );
          exports.tryAuthenticator(++index, endpointUrl, {
            authentcatePromise: authenticator(
              agent.settings,
              agent,
              endpointUrl
            ),
            success: callBack,
            error: callBackError,
            agent: agent,
          });
        } else {
          callBackError(
            new Error(`Not valid authenticator found - ${err.message}.`)
          );
        }
      }
    });
};

/**
 * Try authenticate user by particular authenticator. If authenticator
 * fails try to use next authenticator from Agent.authenticators list.
 * If all authenticators fails call callBackError parameter if any
 * authenticator succeed call callBack parameter
 *
 * The method is used internally in the public authenticated method
 *
 * @private
 *
 * @param {Error} resError error based on the response
 * @param {Object} previousAuthenticator authenticator object
 *
 * @returns {Error} returns object with fatal error which steps authentication
 *
 * @private
 */
exports.fatalAuthenticateError = function (resError, previousAuthenticator) {
  let fatalError;
  if (!resError.unsupported) {
    if (resError.response === undefined) {
      fatalError = new Error(
        `Authenticator ${previousAuthenticator.authenticatorName}: fatal error: ${resError}`
      );
    } else if (resError.response.forbidden) {
      fatalError = new Error(
        `Authenticator ${previousAuthenticator.authenticatorName}: forbidden: ${resError.response.res.text}`
      );
    } else if (resError.response.serverError) {
      fatalError = new Error(
        `Authenticator ${previousAuthenticator.authenticatorName}: server error: ${resError.response.res.text}`
      );
    }
  }
  return fatalError;
};
