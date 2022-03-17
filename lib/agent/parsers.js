"use strict";

const parseString = require("xml2js").parseString;

const parsers = {};

/**
 * Plain text parser for superagent
 *
 * @static
 *
 * @param {Object} res response from the HTTP server
 * @param {Function} done fuunction which is done when all response is readed
 */
parsers["text/plain"] = function parsePlainText(res, done) {
  res.text = "";
  res.setEncoding("utf8");
  res.on("data", function (chunk) {
    res.text += chunk;
  });
  res.on("end", function () {
    done(null, res.text);
  });
};

/**
 * XML parser for superagent
 *
 * @static
 *
 * @param {Object} res response from the HTTP server
 * @param {Function} done fuunction which is done when all response is readed and parase
 */
parsers["application/xml"] = function parseXML(res, done) {
  res.text = "";
  res.setEncoding("utf8");
  res.on("data", function (chunk) {
    res.text += chunk;
  });
  res.on("end", function () {
    parseString(res.text, function (err, output) {
      if (err) {
        done(err);
      } else {
        done(null, output);
      }
    });
  });
};

/**
 * HTML parser for superagent. Just collect text. HTML parseng by jsdom
 * is postponed for performace issues
 *
 * @static
 *
 * @param {Object} res response from the HTTP server
 * @param {Function} done fuunction which is done when all response is readed and parase
 */
parsers["text/html"] = function parseHTML(res, done) {
  res.text = "";
  res.setEncoding("utf8");
  res.on("data", function (chunk) {
    res.text += chunk;
  });
  res.on("end", function () {
    done(null, res.text);
  });
};

/**
 * JSON parser for superagent. Just collect text and parse
 * JSON when all response is received
 *
 * @static
 *
 * @param {Object} res response from the HTTP server
 * @param {Function} done fuunction which is done when all response is readed and parase
 */
parsers["application/json"] = function parseJSON(res, done) {
  res.text = "";
  res.setEncoding("utf8");
  res.on("data", (chunk) => {
    res.text += chunk;
  });
  res.on("end", () => {
    let body;
    let err;
    try {
      body = res.text && JSON.parse(res.text);
    } catch (e) {
      err = e;
      err.rawResponse = res.text || null;
      err.statusCode = res.statusCode;
    } finally {
      done(err, body);
    }
  });
};

/**
 * JSON parser for superagent. Just collect text and parse
 * JSON when all response is received
 *
 * @static
 *
 * @param {Object} res response from the HTTP server
 * @param {Function} done fuunction which is done when all response is readed and parase
 */
function parseBinary(res, done) {
  let binaryBuffer = Buffer.alloc(0);
  res.on("data", (chunk) => {
    binaryBuffer = Buffer.concat([binaryBuffer, chunk]);
  });
  res.on("end", () => {
    done(null, binaryBuffer);
  });
}
parsers["application/pdf"] = parseBinary;
parsers["application/vnd.ms-excel"] = parseBinary;
parsers["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] =
  parseBinary;

/**
 * Parse response from count. Raises error for invalid
 * number in body
 *
 * @param {String} responseText response
 *
 * @return {Number} returns
 *
 * @memberof QueryableResource
 */
parsers.count = function (responseText) {
  const count = parseInt(responseText, 10);

  if (isNaN(count)) {
    throw new Error("Backend returns invalid count value.");
  }

  return count;
};

module.exports = parsers;
