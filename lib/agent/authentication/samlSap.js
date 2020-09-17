"use strict";

const parseXML = require("xml2js").parseString;
const _ = require("lodash");
const URL = require("url").URL;
const { JSDOM } = require("jsdom");

/**
 * Try to load service endpoint with SAP specific SAML authentication
 *
 * @public
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
    superagent
      .get(endpointUrl)
      .then((response) => {
        if (authenticate.isPossible(response)) {
          authenticate
            .samlHandshake(settings, superagent, response)
            .then(resolve, reject);
        } else {
          let err = new Error(
            "OData server does not support SAP - SAML authentification."
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

authenticate.authenticatorName = "SAML SAP";

/**
 * Main function which goes thru SAML redirects to login form. Fill login form
 * and check result from its. Redirects SAML response back to destinatioin system
 * and resolve endpoint response after authentification.
 *
 * @private
 *
 * @param {Object} settings - normalized OData library settings. contains
 *        user creadentials
 * @param {superagent} superagent - instance of superagent HTTP client
 * @param {Object} responseFromEndpointUrl - structure which contains all information
 *        about request and response from endpoint url before authentication
 *
 * @returns {Promise} promise which is resolve by response from endpont url after
 *        authentication or rejected for invalid credentials.
 */
authenticate.samlHandshake = function (
  settings,
  superagent,
  responseFromEndpointUrl
) {
  return authenticate
    .submitRedirectToLoginForm(settings, superagent, responseFromEndpointUrl)
    .then((responseWithLoginForm) => {
      return authenticate.submitLoginForm(
        settings,
        superagent,
        responseWithLoginForm
      );
    })
    .then((responseFromLoginForm) => {
      if (authenticate.checkResponseFromLoginPage(responseFromLoginForm)) {
        return new Promise((resolve, reject) => {
          authenticate
            .submitRedirectFromLoginForm(
              settings,
              superagent,
              responseFromLoginForm
            )
            .then(resolve)
            .catch(
              authenticate.processDestinationSystemError.bind(null, reject)
            );
        });
      } else {
        return Promise.reject(
          new Error(
            `SAML Identify provider rejected authentification for ${_.get(
              settings,
              "auth.username",
              ""
            )}.`
          )
        );
      }
    });
};

/**
 * Process and reject error from endpointurl after SAML authentication.
 * Destination service could reject authorization or it could be down ...
 *
 * @private
 *
 * @param {Function} callBackError - reject function from new promise
 *        it is called with error
 * @param {Function} errorHttp - http error with response which contains
 *        error details
 */
authenticate.processDestinationSystemError = function (
  callBackError,
  errorHttp
) {
  if (
    _.get(errorHttp, "response.header.content-type", "").match(
      "application/xml"
    )
  ) {
    parseXML(
      _.get(errorHttp, "response.res.text", ""),
      (errorParseXML, parsedXML) => {
        let customizedError = errorHttp;
        let messages = _.get(parsedXML, "error.message");
        if (_.isArray(messages) && messages.length > 0) {
          customizedError = new Error(
            _.chain(_.get(parsedXML, "error.message"))
              .map((message) => _.get(message, "_"))
              .join("\n")
              .value()
          );
        }
        callBackError(customizedError);
      }
    );
  } else {
    callBackError(errorHttp);
  }
};

/**
 * Go thru SAML request/responses which is implemented as chain of the
 * requests/responses with HTML pages with forms
 *
 * @private
 *
 * @param {Function} requestGenerator - function which generates promise
 *        for next HTTP request or return null if previous requests was
 *        last in the request chain
 * @param {Promise} previousRequestPromise - promise which is resolved/rejected
 *        from previous requests in requests chain
 * @param {Function} callBack - resolve function from Promise object constructor
 *        it is called when requests chain is done
 * @param {Function} callBackError - reject function from new promise
 *        it is called with error on any request in chain
 */
authenticate.followRequests = function (
  requestGenerator,
  previousRequestPromise,
  callBack,
  callBackError
) {
  previousRequestPromise
    .then((response) => {
      let nextRequestPromise = requestGenerator(response);
      if (nextRequestPromise) {
        authenticate.followRequests(
          requestGenerator,
          nextRequestPromise,
          callBack,
          callBackError
        );
      } else {
        callBack(response);
      }
    })
    .catch((err) => {
      callBackError(err);
    });
};

/**
 * Generates handler which process SAML requests and responses
 *
 * @private
 *
 * @param {String} actionFunctionName - name of the function which
 *        creates requests for specified SAML chain (SAMLRequest,
 *        SAMLResponse or login form)
 *
 * @returns {Function} generated handler
 */
authenticate.generateFormHandler = function (actionFunctionName) {
  return function (settings, localAgent, responseFromEndpointUrl) {
    return new Promise((resolve, reject) => {
      authenticate.followRequests(
        authenticate[actionFunctionName].bind(null, settings, localAgent),
        Promise.resolve(responseFromEndpointUrl),
        resolve,
        reject
      );
    });
  };
};

authenticate.submitRedirectToLoginForm = authenticate.generateFormHandler(
  "submitRedirectToLoginFormAction"
);
authenticate.submitLoginForm = authenticate.generateFormHandler(
  "submitLoginFormAction"
);
authenticate.submitRedirectFromLoginForm = authenticate.generateFormHandler(
  "submitRedirectFromLoginFormAction"
);

/**
 * Convert parameter defined by object to urlencoded form parameter
 *
 * @param {superagent} postActionAcc superagent request
 * @param {Object} formParameter object with keys name and value which
 *        corresponds with the form input
 *
 * @returns {superagent} updated superagent request
 */
function reduceFormParameter(postActionAcc, formParameter) {
  postActionAcc = postActionAcc.send(
    `${encodeURIComponent(formParameter.name)}=${encodeURIComponent(
      formParameter.value
    )}`
  );
  return postActionAcc;
}

/**
 * Filter for inputs which has name parameter
 *
 * @param {Object} formParameter object with keys name and value which
 *        corresponds with the form input
 *
 * @returns {Boolean} true if parameter name is correct
 */
function filterFormInputs(formParameter) {
  return formParameter.name;
}

/**
 * Filter for inputs which has name parameter
 *
 * @param {HTMLFormElement} samlForm object which represents SAML form
 * @param {*} placeholder just follow lodash API
 * @param {Number} index index of element in the form
 *
 * @returns {Object} object with name and value keys which corresponds
 *        with input element
 */
function mapFormInputs(samlForm, placeholder, index) {
  let input = samlForm.elements[index];
  return {
    value: input.getAttribute("value"),
    name: input.getAttribute("name"),
  };
}

/**
 * Follow SAML from redirects to login form
 *
 * @private
 *
 * @param {Object} settings - normalized OData library settings. contains
 *        user creadentials
 * @param {superagent} localAgent - instance of superagent HTTP client
 * @param {Object} response from endpointUrl which is starting point for SAML authentificaton
 *
 * @return {superagent} request (which mimic Promise) and is is resolved/rejected when login page
 *         is found
 */
authenticate.submitRedirectToLoginFormAction = function (
  settings,
  localAgent,
  response
) {
  let samlForm;
  let postAction;
  let dom = new JSDOM(response.body);
  let samlRequest = dom.window.document.querySelector(
    'input[name="SAMLRequest"]'
  );
  let loginForm = false;

  if (samlRequest) {
    samlForm = samlRequest.form;
    postAction = _.chain(new Array(samlForm.elements.length))
      .map(mapFormInputs.bind(null, samlForm))
      .filter(filterFormInputs)
      .map((formParameter) => {
        if (
          formParameter.name.match(
            /username/ || formParameter.name.match(/password/)
          )
        ) {
          loginForm = true;
        }
        formParameter.value = formParameter.value || "";
        return formParameter;
      })
      .reduce(
        reduceFormParameter,
        localAgent.post(
          authenticate.nextRequestUrl(samlForm.getAttribute("action"), response)
        )
      )
      .value();
    if (loginForm) {
      postAction = null;
    }
  }
  return postAction;
};

/**
 * Submit SAP SAML login form
 *
 * @private
 *
 * @param {Object} settings - normalized OData library settings. contains
 *        user creadentials
 * @param {superagent} localAgent - instance of superagent HTTP client
 * @param {Object} response from endpointUrl which is starting point for SAML authentificaton
 *
 * @return {superagent} request (which mimic Promise) and is is resolved/rejected when login page
 *         is found
 */
authenticate.submitLoginFormAction = function (settings, localAgent, response) {
  let samlForm;
  let submitLoginFormAction;
  let dom = new JSDOM(response.body);
  let samlRequest = dom.window.document.querySelector(
    'input[name="SAMLRequest"]'
  );

  if (samlRequest) {
    samlForm = samlRequest.form;
    submitLoginFormAction = _.chain(new Array(samlForm.elements.length))
      .map(mapFormInputs.bind(null, samlForm))
      .filter(filterFormInputs)
      .map((formParameter) => {
        if (formParameter.name.match(/username/)) {
          formParameter.value = _.get(settings, "auth.username", "");
        }
        if (formParameter.name.match(/password/)) {
          formParameter.value = _.get(settings, "auth.password", "");
        }
        formParameter.value = formParameter.value || "";
        return formParameter;
      })
      .reduce(
        reduceFormParameter,
        localAgent.post(
          authenticate.nextRequestUrl(samlForm.getAttribute("action"), response)
        )
      )
      .value();
  }
  return submitLoginFormAction;
};

/**
 * Process SAML response redirects by forms
 *
 * @private
 *
 * @param {Object} settings - normalized OData library settings. contains
 *        user creadentials
 * @param {superagent} localAgent - instance of superagent HTTP client
 * @param {Object} response from login page request
 *
 * @return {superagent} request (which mimic Promise) and is is resolved/rejected when all SAML response
 *         forms are processed
 */
authenticate.submitRedirectFromLoginFormAction = function (
  settings,
  localAgent,
  response
) {
  let samlForm;
  let postAction;
  let dom = new JSDOM(response.body);
  let samlRequest = dom.window.document.querySelector(
    'input[name="SAMLResponse"]'
  );

  if (samlRequest) {
    samlForm = samlRequest.form;
    postAction = _.chain(new Array(samlForm.elements.length))
      .map(mapFormInputs.bind(null, samlForm))
      .filter((formParameter) => {
        return formParameter.name;
      })
      .map((formParameter) => {
        formParameter.value = formParameter.value || "";
        return formParameter;
      })
      .reduce(
        reduceFormParameter,
        localAgent.post(
          authenticate.nextRequestUrl(samlForm.getAttribute("action"), response)
        )
      )
      .value();
  }
  return postAction;
};

/**
 * Check valid response from login page. If response contains SAMLRequests
 * (sumbit from login page returns login page again) credentials is invalid.
 *
 * @private
 *
 * @param {Object} responseAfterLoginSubmit from login page request
 *
 * @return {Boolean} credentials are correct/incorrect true/false
 */
authenticate.checkResponseFromLoginPage = function (responseAfterLoginSubmit) {
  let dom = new JSDOM(responseAfterLoginSubmit.body);
  let samlRequest = dom.window.document.querySelector(
    'input[name="SAMLRequest"]'
  );
  return !samlRequest;
};

/**
 * Create URL for next hop from current response and current
 * action in form (form sometimes contains all URL and sometimes
 * just path.
 *
 * @private
 *
 * @param {String} formAction path or fullurl from action attribute
 *        of SAML/Login form
 * @param {Object} response object with last response which contains
 *        requested URL
 *
 * @returns {String} full url
 */
authenticate.nextRequestUrl = function (formAction, response) {
  let requestUrl;
  try {
    requestUrl = new URL(formAction);
  } catch (err) {
    requestUrl = new URL(formAction, _.get(response, "request.url"));
  }
  return requestUrl.href;
};

/**
 * Try to load service endpoint with SAP specific SAML authentication
 *
 * @private
 *
 * @param {Object} response - object generated by HTTP Client which
 *        contains all informations about HTTP response and HTTP request
 *        to OData endpoint
 *
 * @return {Promise} the promise is resolved when endpoint is correctly loaded,
 *                       the promise is rejected othewise
 */
authenticate.isPossible = function (response) {
  let dom;
  let isPossible = false;

  if (
    _.get(response, "statusCode", null) === 200 &&
    _.get(response, "headers.content-type", "").match(/text\/html/) &&
    _.get(response, "headers.sap-server", "") === "true"
  ) {
    dom = new JSDOM(response.body);
    if (dom.window.document.querySelector('input[name="SAMLRequest"')) {
      isPossible = true;
    }
  }

  return isPossible;
};

module.exports = authenticate;
