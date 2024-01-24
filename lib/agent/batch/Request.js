"use strict";

const _ = require("lodash");
const Response = require("./Response");

/**
 * Request class implements OData particular request processing
 *
 * @public
 * @class Request
 */
class Request {
  /**
   * Initialize instance of the batch Request class
   *
   * @param {string} httpMethod is string (GET/POST/MERGE/PUT/DELETE) which identifies HTTP method
   * @param {string} inputUrl is relative path to the service endpoint
   * @param {Object} headers is headers (Accept header has to be defined and it has to be application/json
   * @param {string} payload body of the request
   *
   * @public
   * @memberof Request
   */
  constructor(httpMethod, inputUrl, headers, payload) {
    let resolveRequest;
    let rejectRequest;

    Object.defineProperty(this, "promise", {
      value: new Promise(function (resolve, reject) {
        resolveRequest = resolve;
        rejectRequest = reject;
      }),
      writable: false,
    });

    Object.defineProperty(this, "httpMethod", {
      value: httpMethod,
      writable: false,
    });

    Object.defineProperty(this, "inputUrl", {
      value: inputUrl,
      writable: false,
    });

    Object.defineProperty(this, "headers", {
      value: headers,
      writable: false,
    });

    Object.defineProperty(this, "content", {
      value: payload,
      writable: false,
    });

    Object.defineProperty(this, "resolve", {
      value: resolveRequest,
      writable: false,
    });

    Object.defineProperty(this, "reject", {
      value: rejectRequest,
      writable: false,
    });

    this.responseType = null;
  }

  /**
   * Generate HTTP request which is part of thh multipart/mixed content for the OData batch
   *
   * @param {string} csrfToken passed to request headers
   *
   * @returns {string} request converted to the string
   *
   * @private
   * @memberof Request
   */
  payload(csrfToken) {
    let inputUrl = this.inputUrl.replace(/^\//, "");
    let body = this.body();
    return _.concat(
      ["Content-Type: application/http"],
      this.contentId ? [`Content-Id: ${this.contentId}`] : [],
      body.length > 0 ? [] : [`x-csrf-token: ${csrfToken}`],
      [
        "Content-Transfer-Encoding: binary\n",
        `${this.httpMethod} ${inputUrl} HTTP/1.1`,
        _.map(
          _.assign(
            body.length > 0
              ? _.assign(
                  {
                    "Content-Length": _.get(body, 0).length,
                  },
                  csrfToken ? { "x-csrf-token": `${csrfToken}` } : {}
                )
              : {},
            this.headers
          ),
          (value, key) => `${key}: ${value}`
        ).join("\n"),
      ],
      body.length > 0 ? "" : "\n",
      body
    ).join("\n");
  }

  /**
   * Create JSON string which contains body of the request
   *
   * @returns {string} JSON content
   *
   * @private
   * @memberof Request
   */
  body() {
    let content = [];
    if (this.content && _.get(this, "headers.Accept") === "application/json") {
      content = [JSON.stringify(this.content)];
    } else if (this.content) {
      throw new Error(
        `Stringifying for ${_.get(this, "headers.Accept")} not supported`
      );
    }
    return content;
  }

  /**
   * Parse response part of the OData batch response for the particular specified
   *
   * @param {string} rawResponse - part of the batch response for the specified request
   *
   * @returns {Promise} promise which is resolved by the particular response is parsed
   *
   * @private
   * @memberof Batch
   */
  process(rawResponse) {
    let response = new Response(rawResponse);
    response.request = this;
    response.promise.then(this.resolve).catch(this.reject);
    return this.promise;
  }
}

module.exports = Request;
