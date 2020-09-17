"use strict";

const Batch = require("./Batch");
const Base = require("./Base");
const _ = require("lodash");

/**
 * The class manages the batches defined by the OData client
 *
 * @see http://docs.oasis-open.org/odata/odata/v4.01/cs01/part1-protocol/odata-v4.01-cs01-part1-protocol.html#_Toc505771274
 *
 * @class Manager
 */
class Manager extends Base {
  /**
   * Creates an instance of <code>Manager</code>.
   *
   * @memberof Manager
   */
  constructor() {
    super("batches");
  }

  /**
   * Add new batch object to the list of the batches
   *
   * @return {Object} newly created the batch object which represents future batch request
   *
   * @public
   * @memberof Manager
   */
  add() {
    let batch = super.add(Batch);
    return batch;
  }

  /**
   * Remove batch from the currently registered batch objects
   *
   * @param {Object} batch object for remove
   *
   * @return {Object} removed batch object
   *
   * @private
   * @memberof Manager
   */
  remove(batch) {
    return this.batches.splice(this.indexOf(batch), 1);
  }

  /**
   * Check existency of passed batch in registered batches
   *
   * @param {Object} batch to check
   *
   * @return {Boolean} true if batch object exists
   *
   * @public
   * @memberof Manager
   */
  has(batch) {
    return this.batches.length > 0 && !!this.batches[this.indexOf(batch)];
  }

  /**
   * Find index of batch passed as parameter. Raise error if batch is not
   * Batch type
   *
   * @param {Batch} batch to find
   *
   * @return {Number} index of the found batch or -1 if does not exists
   *
   * @public
   * @memberof Manager
   */
  indexOf(batch) {
    let id;
    let index = -1;

    if (!(batch instanceof Batch)) {
      throw new Error("Only instance of batch has to be found.");
    }

    id = _.get(batch, "id");
    if (_.isString(id)) {
      index = _.findIndex(this.batches, (processedBatch) => {
        return _.get(processedBatch, "id") === id;
      });
    }

    return index;
  }

  get defaultBatch() {
    return this.batches.length > 0 ? this.batches[0] : undefined;
  }

  get defaultChangeSet() {
    return this.defaultBatch ? this.defaultBatch.defaultChangeSet : undefined;
  }
}

module.exports = Manager;
