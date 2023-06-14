"use strict";

const crypto = require("crypto");
const _ = require("lodash");

/**
 * Base class for batch classes which implements list of other batch objects
 * (batches, changsets, requests)
 *
 * @private
 * @class Base
 */
class Base {
  /**
   * Call the method by the <code>super</code>
   *
   * @param {String} listName is the name of the property in the
   *        descendant class which is use as list of batch objects
   * @param {String} boundaryPrefix the boundary prefix for the
   * 		  multipart content of the batch request
   *
   * @public
   * @memberof Base
   */
  constructor(listName, boundaryPrefix) {
    if (!_.isString(listName)) {
      throw new Error("Invalid definition of the main list of batch objects");
    }
    Object.defineProperty(this, "listName", {
      value: listName,
      writable: false,
    });
    Object.defineProperty(this, "boundaryPrefix", {
      value: boundaryPrefix || "",
      writable: false,
    });
    Object.defineProperty(this, "id", {
      value: this.generateId(),
      writable: false,
    });
    Object.defineProperty(this, listName, {
      value: [],
      writable: false,
    });
  }

  /**
   * Add new item to the batch list object
   *
   * @param {Class} BatchObject class definition for newly created object
   *
   * @returns {Object} create instance of the BatchObject class
   *
   * @private
   * @memberof Base
   */
  add(BatchObject, ...args) {
    let batchObject = new BatchObject(...args);

    this[this.listName].push(batchObject);

    return batchObject;
  }

  /**
   * Generate id for the batch object (for batches and changests) which
   * identifies the batch object
   *
   * @returns {String} returns string with 12 hexadecimal numbers
   *
   * @private
   * @memberof Base
   */
  generateId() {
    return crypto.randomBytes(6).toString("hex");
  }

  /**
   * Generate batch boundary for the multipart/mixed content
   *
   * @returns {String} boundary used by the batch response
   *
   * @private
   * @memberof Batch
   */
  boundary() {
    return `${this.boundaryPrefix}_${_.map([0, 1, 2], (index) =>
      this.id.substring(index * 4, (index + 1) * 4)
    ).join("-")}`;
  }
}

module.exports = Base;
