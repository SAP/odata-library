"use strict";

const _ = require("lodash");
const url = require("./url");
const BatchManager = require("./batch/Manager");
const log = require("./log");
const xml2js = require("xml2js");
const tough = require("tough-cookie");
const authentication = require("./authentication");
const https = require("https");

const AUTH_HEADERS = Symbol("AUTH_HEADERS");
const CSRF_TOKEN = Symbol("CSRF_TOKEN");

let requestCounter = 0;

/**
 * Service endpoint agent.
 * Handles all GET/POST/PUT/DELETE ... methods to the service endpoint.
 *
 * @class Agent
 */

class Agent {
  /**
   * Creates an instance of <code>Agent</code>.
   *
   * @param {Object} settings define service endpoint
   *
   * @memberof Agent
   */
  constructor(settings) {
    Object.defineProperty(this, "logger", {
      value: this.initializeLogger(settings),
      writable: false,
    });

    Object.defineProperty(this, "settings", {
      value: settings,
      writable: false,
    });

    Object.defineProperty(this, "prefix", {
      value: settings.url.replace(/\/$/, ""),
      writable: false,
    });

    Object.defineProperty(this, "batchManager", {
      value: new BatchManager(),
      writable: false,
    });

    Object.defineProperty(this, "cookieJar", {
      value: new tough.CookieJar(),
      writable: false,
    });
    Object.defineProperty(this, "defaultFetchOptions", {
      value: this.initializeDefaultFetchOptions(settings),
      writable: false,
    });
  }

  /**
   * Initialize object merged with user definined options
   * for fetch and passed as options to the node-fetch
   *
   * @param {Object} settings define service endpoint
   *
   * @returns {Object} initialized options
   */
  initializeDefaultFetchOptions(settings) {
    const AGENT_OPTIONS = ["cert", "key", "pfx", "ca", "passphrase"];
    const defaultAgentOptions = _.pick(_.get(settings, "auth"), AGENT_OPTIONS);
    const defaultFetchOptions = {};

    if (_.keys(defaultAgentOptions).length > 0) {
      defaultFetchOptions.agent = new https.Agent(defaultAgentOptions);
    }

    return defaultFetchOptions;
  }

  /**
   * Initialize logger instance
   *
   * @param {Object} settings define service endpoint
   *
   * @returns {Object} object which implements trace, debug, info, warn, error methods.
   *
   * @memberof Agent
   */
  initializeLogger(settings) {
    let logger = {
      trace: () => {},
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    };
    let methods = _.keys(logger);

    if (_.has(settings, "logger")) {
      _.each(methods, (methodName) => {
        if (!_.isFunction(_.get(settings, `logger.${methodName}`))) {
          throw new Error(
            `Cannot initialize logger: ${methodName} is not a function`
          );
        }
      });
      logger = settings.logger;
    }
    return logger;
  }

  /**
   * Convert parameters map to query string
   *
   * @param {Object} parameters - contains information which is user to request metadata
   *
   * @returns {String} search part of the metadata URL
   *
   * @memberof Agent
   */
  metadataSearch(parameters) {
    return _.chain(parameters)
      .keys()
      .filter(
        (key) =>
          _.isArray(parameters[key]) ||
          _.isString(parameters[key]) ||
          _.isNumber(parameters[key])
      )
      .map(
        (key) =>
          `${key}=${
            _.isArray(parameters[key])
              ? parameters[key].join(",")
              : parameters[key]
          }`
      )
      .join("&")
      .value();
  }

  /**
   * Send requests to service metadata
   *
   * @returns {Promise} which done when all metadata requests ar loaded and metadata is merged.
   *
   * @memberof Agent
   */
  metadata() {
    let metadataUrls = _.concat(
      //Core metadata data url
      [
        `${this.prefix}/$metadata?${this.metadataSearch(
          this.settings.parameters
        )}`,
      ],
      //Add metadata url if exists
      this.settings.annotationsUrl
        ? url.appendSearch(
            this.settings.annotationsUrl,
            this.metadataSearch(this.settings.parameters)
          )
        : []
    );

    return authentication.authenticate(this, metadataUrls[0]).then(() => {
      return Promise.all(
        _.map(metadataUrls, (requestUrl) =>
          this.createMetadataRequest(requestUrl)
        )
      ).then((responses) => {
        this.logger.info("All metadata succesfully fetched.");
        return responses;
      });
    });
  }

  /**
   * Creates metadata requests from url
   *
   * @param {string} metadataUrl URL of the metadata
   *
   * @returns {Promise} which done where metadata request is loaded
   *
   * @memberof Agent
   */
  createMetadataRequest(metadataUrl) {
    return new Promise((resolve, reject) => {
      this.fetch(metadataUrl)
        .then((res) => {
          this.logger.info(
            `Metadata successfully fetched from '${metadataUrl}'.`
          );
          return res.text();
        })
        .then((resText) => {
          xml2js.parseString(resText, function (err, output) {
            if (err) {
              reject(err);
            } else {
              resolve(output);
            }
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Wrapper around GET function. All parameters are passed to fetch method
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   *
   * @returns {Promise} promise which is done when GET request is finished
   *
   * @memberof Agent
   */
  get(...args) {
    return this.sendRequest("GET", ...args);
  }

  /**
   * Wrapper around POST function. All parameters are passed to fetch method
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the post request
   * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
   *
   * @returns {Promise} promise which is done when POST request is finished
   *
   * @memberof Agent
   */
  post(...args) {
    return this.sendRequest("POST", ...args);
  }

  /**
   * Wrapper around PUT function. All parameters are passed to fetch method
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the PUT request
   * @param {Object} payload data which is converted to the JSON string and passed as body of PUT request
   *
   * @returns {Promise} promise which done when PUT request is finished
   *
   * @memberof Agent
   */
  put(...args) {
    return this.sendRequest("PUT", ...args);
  }

  /**
   * Wrapper around fetch API http requests. All parameters are passed to fetch
   *
   * @private
   *
   * @param {String} httpMethod name of the HTTP method
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the post request
   * @param {Object} payload data which is converted to the JSON string and passed as body of POST request
   *
   * @returns {Promise} which done when request of HTTP method definned by parameters has finished
   *
   * @memberof Agent
   */
  sendRequest(httpMethod, inputUrl, headers, payload) {
    let fetchTokenPromise = Promise.resolve();
    let options = {
      method: httpMethod.toUpperCase(),
      headers: {},
    };
    let requestUrl = `${url.normalize(inputUrl, this.prefix)}`;

    if (payload) {
      options.body = payload;
    }

    if (_.isObject(headers)) {
      options.headers = headers;
    }

    if (options.method !== "GET") {
      fetchTokenPromise = this.fetchToken().then((token) => {
        options.headers["x-csrf-token"] = token;
      });
    }

    return fetchTokenPromise.then(() => {
      return this.fetch(requestUrl, options);
    });
  }

  /**
   * Send batch request defined by the batch object passed as parameter
   *
   * @private
   *
   * @param {Object} [batch] represents batch request, if batch is not
   *        passed use default batch from batch/Manager
   * @param {Boolean} raw if the parameter is false response contains
   *        just array of parsed OData responses. If the parameter is true
   *        response contains HTTP.Response with property batchResponse.
   *        The batchResponses contains list of particular respones from
   *        the requests send over bulk batch request.
   *
   * @returns {Promise} which done when batch request is resolved
   *
   * @memberof Agent
   */
  batch(batch, raw = false) {
    let batchNormalized = batch || this.batchManager.defaultBatch;
    let payload;

    return this.fetchToken()
      .then((csrfToken) => {
        payload = batchNormalized.payload(csrfToken);
        return this.sendRequest(
          "POST",
          "/$batch",
          _.assign(
            {
              "Content-Type": `multipart/mixed;boundary=${batchNormalized.boundary()}`,
              Accept: "multipart/mixed",
            },
            csrfToken
              ? {
                  "x-csrf-token": csrfToken,
                }
              : {}
          ),
          payload,
          true
        );
      })
      .then((batchResponse) => {
        return batchNormalized
          .process(batchResponse)
          .then((requestsResponses) => {
            const normalizedResponse = this.normalizeBatchResponse(
              batchResponse,
              requestsResponses,
              raw
            );
            this.batchManager.remove(batchNormalized);

            return normalizedResponse;
          });
      });
  }

  /**
   * Wrapper around MERGE function. All parameters are passed to fetch. MERGE request
   * is supported by OData protocol 2.0 and older.
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the MERGE request
   * @param {Object} payload data which is converted to the JSON string and passed as body of MERGE request
   *
   *
   * @returns {Promise} promise which done when MERGE request has finished
   *
   * @memberof Agent
   */
  merge(...args) {
    return this.sendRequest("MERGE", ...args);
  }

  /**
   * Create PATCH request. Patch updates the entity. It is supported by OData protocol
   * version 3.0 and newer.
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the GET request
   * @param {Object} payload data which is converted to the JSON string and passed as body of MERGE request in batch
   *
   * @returns {Promise} promise which done when PATCH request has finished
   *
   * @public
   * @memberof Agent
   */
  patch(...args) {
    return this.sendRequest("PATCH", ...args);
  }

  /**
   * Wrapper around DELETE function. All parameters are passed to fetch method
   *
   * @param {String} inputUrl relative path in the service
   * @param {Object} headers object which contains headers used for the delete request
   *
   * @returns {Promise} which is done where delete request has done
   *
   * @memberof Agent
   */
  delete(inputUrl, headers) {
    return this.sendRequest("DELETE", inputUrl, headers);
  }

  /**
   * Send request to fetch CSRF token from backend.
   *
   * @param {String} inputUrl relative path in the service
   *
   * @returns {Promise} which done where token has loaded
   *
   * @memberof Agent
   */
  fetchToken() {
    let promise;
    if (this[CSRF_TOKEN]) {
      promise = Promise.resolve(this[CSRF_TOKEN]);
    } else {
      promise = new Promise((resolve, reject) => {
        this.logger.info("Fetch X-CSRF-Token");
        this.fetch(`${url.normalize("/", this.prefix)}`, {
          headers: { "X-CSRF-Token": "fetch" },
        })
          .then((res) => {
            this[CSRF_TOKEN] = res.headers.get("x-csrf-token");
            this.logger.info("CSRF token successfully downloaded.");
            resolve(this[CSRF_TOKEN]);
          })
          .catch(reject);
      });
    }
    return promise;
  }

  /**
   * Send batch request defined by the batch object passed as parameter
   *
   * @private
   *
   * @param {HTTP.Response} batchResponse response to batch request
   * @param {Object[]} requestsResponses list of responses parsed from batch response
   * @param {Boolean} raw if the parameter is false returns values contains
   * just array of parsed OData responses. If the parameter is true
   * returns batchResponse with list particular responses from batch.
   *
   * @returns {Promise} promise with array or responses parsed from batch
   *          response or batch response object
   *
   * @memberof Agent
   */
  normalizeBatchResponse(batchResponse, requestsResponses, raw) {
    let normalizedBatchResponse;

    if (raw) {
      normalizedBatchResponse = _.assign(batchResponse, {
        batchResponses: requestsResponses,
      });
    } else {
      normalizedBatchResponse = _.chain([])
        .concat(...requestsResponses)
        .map((response) =>
          response instanceof Error
            ? response
            : response.plain(this._listResultPath, this._instanceResultPath)
        )
        .value();
    }

    return Promise.resolve(normalizedBatchResponse);
  }

  /**
   * Determine path to result content
   *
   * @param {Boolean} isList true if result is array
   * @param {Object} result object with response from backend
   *
   * @return {String} path with dot notation to content of response
   */
  getResultPath(isList, result) {
    return isList && _.has(result, this._listResultPath)
      ? this._listResultPath
      : this._instanceResultPath;
  }

  /**
   * Initialize version dependent properties
   *
   * @param {String} version identification of currect service version
   */
  setServiceVersion(version) {
    Object.defineProperty(this, "serviceVersion", {
      value: version,
      writable: false,
    });

    if (!["1.0", "4.0"].includes(version)) {
      throw new Error(`OData Service version '${version}' is not supported.`);
    }

    let isV4 = version === "4.0";
    Object.defineProperty(this, "_listResultPath", {
      value: isV4 ? "value" : "d.results",
      writable: false,
    });

    Object.defineProperty(this, "_instanceResultPath", {
      value: isV4 ? "" : "d",
      writable: false,
    });
  }

  /**
   * Envelope (fetch API) to support authentication
   *
   * @public
   *
   * @param {String} requestUrl endpoint for HTTP request
   * @param {Object} [opts] options passed to enveloped fetch (with auth parameters)
   *
   * @returns {Promise} promise which is resolved when HTTP request is done
   */
  fetch(requestUrl, opts = {}) {
    let normalizedOpts;
    let isRequestedManualRedirect;
    let follow;
    let response;
    let counter;

    if (!_.isObject(opts)) {
      throw new Error("Invalid options passed for HTTP request.");
    }

    normalizedOpts = _.assign({}, this.defaultFetchOptions, opts);
    counter = requestCounter++;

    isRequestedManualRedirect = normalizedOpts.redirect === "manual";
    follow = normalizedOpts.follow;

    return this.readCookies(requestUrl)
      .then((cookies) => {
        this.appendHeaders({ Cookie: cookies }, normalizedOpts);
        this.appendHeaders(this[AUTH_HEADERS], normalizedOpts);
        log.logRequest(
          this.logger,
          counter,
          requestUrl,
          _.pickBy(normalizedOpts, (value, key) => key !== "agent")
        );
        return fetch(
          requestUrl,
          _.assign({ redirect: "manual" }, normalizedOpts)
        );
      })
      .then((res) => {
        response = res;
        return response;
      })
      .then(this.saveCookies.bind(this))
      .then(() => {
        return this.isResponseRedirect(
          response,
          follow,
          isRequestedManualRedirect
        )
          ? this.redirect(counter, requestUrl, normalizedOpts, response)
          : this.processResponse(counter, requestUrl, normalizedOpts, response);
      });
  }

  /**
   * Append counter to the response as identification for content log
   * after its processing
   *
   * @private
   *
   * @param {Number} counter sequence number for currrent request
   * @param {String} requestUrl endpoint for HTTP request
   * @param {Object} opts options passed to enveloped fetch (with auth parameters)
   * @param {HTTP.Response} response from fetch
   *
   * @returns {Promise} promise which is resolved when HTTP response is procesed
   */
  processResponse(counter, requestUrl, opts, response) {
    let promise;
    log.logResponse(this.logger, counter, requestUrl, opts);
    response.requestCounter = counter;
    if (response.status >= 400) {
      promise = response.text().then((errorText) => {
        let err = new Error(errorText || response.statusText);
        err.name = response.statusText;
        err.status = response.status;
        return Promise.reject(err);
      });
    } else {
      promise = Promise.resolve(response);
    }
    return promise;
  }

  /**
   * Redirect response
   *
   * @private
   *
   * @param {Number} counter sequence number for currrent request
   * @param {String} requestUrl endpoint for HTTP request
   * @param {Object} opts options passed to enveloped fetch (with auth parameters)
   * @param {HTTP.Response} response from fetch
   *
   * @returns {Promise} promise which is resolved when redirect is processed
   */
  redirect(counter, requestUrl, opts, response) {
    let statusOpts = Object.assign(
      {},
      opts.follow !== undefined ? { follow: opts.follow - 1 } : {}
    );

    log.logResponse(this.logger, counter, requestUrl, opts, response);

    if (response.status !== 307) {
      statusOpts.method = "GET";
      statusOpts.body = null;
    }

    return this.fetch(
      this.nextRequestUrl(response.headers.get("location"), response),
      Object.assign({}, statusOpts),
      true
    );
  }

  /**
   * Create URL for next hop from current response and current
   * action in form (form sometimes contains all URL and sometimes
   * just path.
   *
   * @private
   *
   * @param {String} requestedUrl path or fullurl from action attribute
   *        of SAML/Login form
   * @param {Object} response object with last response which contains
   *        requested URL
   *
   * @returns {String} full url
   */
  nextRequestUrl(requestedUrl, response) {
    let requestUrl;

    try {
      requestUrl = new URL(requestedUrl);
    } catch (err) {
      requestUrl = new URL(requestedUrl, _.get(response, "url"));
    }
    return requestUrl.href;
  }

  /**
   * Read cookies from local cookie storag
   *
   * @private
   *
   * @param {String} requestUrl endpoint for HTTP request
   *
   * @returns {Promise} promise which is resolved when cookies has read
   */
  readCookies(requestUrl) {
    return new Promise((resolve, reject) => {
      this.cookieJar.getCookieString(
        typeof requestUrl === "string" ? requestUrl : requestUrl.url,
        (err, cookies) => {
          if (err) {
            reject(err);
          } else {
            resolve(cookies);
          }
        }
      );
    });
  }

  /**
   * Finds out if response is redirect
   *
   * @private
   *
   * @param {HTTP.Response} response from fetch
   * @param {Number} follow is the follow header from request options
   * @param {Boolean} isRequestedManualRedirect determine manual redirect management
   *
   * @returns {Boolean} true if response is redirect to other HTTP url
   */
  isResponseRedirect(response, follow, isRequestedManualRedirect) {
    return (
      [303, 302, 307].some(
        (redirectStatus) => response.status === redirectStatus
      ) &&
      isRequestedManualRedirect !== true &&
      follow !== 0
    );
  }

  /**
   * Safely add additional headers to the request headers
   *
   * @private
   *
   * @param {Object} headers additional headers
   * @param {Object} opts object which is passed to the fetch and which is updated
   */
  appendHeaders(headers, opts) {
    let normalizedHeaders;
    if (_.isObject(opts) && _.isObject(headers)) {
      normalizedHeaders = _.pickBy(headers, (value) => !_.isNil(value));
      if (
        _.isObject(opts.headers) &&
        typeof opts.headers.append === "function"
      ) {
        _.each(normalizedHeaders, (value, key) => {
          opts.headers.append(key, value);
        });
      } else {
        opts.headers = Object.assign({}, opts.headers, normalizedHeaders);
      }
    }
  }

  /**
   * Save cookie to local cookie storage
   *
   * @private
   *
   * @param {HTTP.Response} response from fetch
   *
   * @return {Promise} promise which is resolved when cookies are saved
   */
  saveCookies(response) {
    let cookies = response.headers.getSetCookie();

    //Store all present cookies
    return Promise.all(
      cookies
        .map((cookieString) => tough.Cookie.parse(cookieString))
        .map(
          (cookie) =>
            new Promise((resolve, reject) => {
              this.cookieJar.setCookie(
                cookie,
                response.url,
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
  }

  setAuthorizationHeaders(authorizationHeaders) {
    if (!_.isObject(authorizationHeaders)) {
      throw new Error("Invalid authorization headers");
    }
    this[AUTH_HEADERS] = authorizationHeaders;
  }
}

module.exports = Agent;
