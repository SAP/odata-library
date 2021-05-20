"use strict";

const _ = require("lodash");
const { URL } = require("url");

/**
 * Add addtional search part to the url
 *
 * @example
 *
 * let updatedUrl = appendSearch("https://localhost/", "foo=2");
 * updatedUrl === "https://localhost/?foo=2";
 *
 * @param {String} inputUrl url for adding new search parameters
 * @param {String} additionalSearch string which contains search parameters for adding
 *
 * @return {String} updated url
 */
function appendSearch(inputUrl, additionalSearch) {
  let url = new URL(inputUrl);
  if (!_.isString(additionalSearch)) {
    throw new Error(
      `Invalid additionalSearch parameter ${additionalSearch} to append search.`
    );
  }

  if (additionalSearch) {
    let searchPrefix = url.search ? url.search + "&" : "?";
    url.search = searchPrefix + additionalSearch;
  }

  return url.toString();
}

/**
 * Append "/" to the beginning of the  path (could be
 * use out of url handling also)
 *
 * @example
 *
 * absolutizePath("foo");  //=> "/foo"
 * absolutizePath("/foo/bar");  //=> "/foo/bar"
 * absolutizePath("//foo/bar");  //=> "/foo/bar"
 *
 * @param {String} path content
 *
 * @return {String} absolutized path
 */
function absolutizePath(path) {
  var retval = path;
  if (_.isString(path)) {
    retval = "/" + path.replace(/^\/*/, "");
  }
  return retval;
}

module.exports = {
  base(inputUrl) {
    var url = new URL(inputUrl);
    return `${url.protocol}//${url.host}${
      !url.pathname || url.pathname === "/" ? "/" : absolutizePath(url.pathname)
    }`;
  },
  normalize(input, base) {
    var urlBase = new URL(base);
    var urlInput = new URL(input, base);
    var basePath = urlBase.pathname;
    var inputPath = urlInput.pathname;

    if (
      _.isString(basePath) &&
      basePath.substring(basePath.length - 1) === "/"
    ) {
      basePath = basePath.substring(0, basePath.length - 1);
    }

    if (_.isString(inputPath) && inputPath.substring(0, 1) === "/") {
      inputPath = inputPath.substring(1);
    }

    urlInput.pathname = basePath + "/" + inputPath;

    return urlInput.href;
  },
  username(inputUrl) {
    var url = new URL(inputUrl);
    return url.username;
  },
  password(inputUrl) {
    var url = new URL(inputUrl);
    return url.password;
  },
  appendSearch: appendSearch,
  absolutizePath: absolutizePath,
};
