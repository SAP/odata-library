"use strict";

const assert = require("assert");
const sinon = require("sinon");
const _ = require("lodash");
const Filter = require("../../../../lib/engine/entitySet/Filter");

describe("Filter", function () {
  it("#constructor()", function () {
    let filter;
    sinon.stub(Filter.prototype, "check");

    Filter.prototype.check.returns(true);
    filter = new Filter("FILTER");
    assert.ok(_.has(filter, "definition"));
    assert.ok(Filter.prototype.check.calledWith("FILTER"));

    Filter.prototype.check.returns(false);
    assert.throws(
      () => {
        filter = new Filter("FILTER");
      },
      {
        message: 'Invalid filter definition "FILTER"',
      }
    );

    Filter.prototype.check.restore();
  });

  it("check", function () {
    assert.ok(Filter.prototype.check("FILTER"));
    assert.ok(!Filter.prototype.check(null));
    assert.ok(!Filter.prototype.check(undefined));
  });

  describe("toURIComponent", function () {
    let encodedFilter = "(AllocationType%20eq%20'ACDOC_CC')";
    it("Do not encoded filter passed as encoded string", function () {
      let filter;
      filter = new Filter(encodedFilter);
      assert.equal(filter.toURIComponent(), encodedFilter);
    });
    it("Do encoded filter defined as string", function () {
      let filter;
      filter = new Filter("(AllocationType eq 'ACDOC_CC')");
      assert.equal(filter.toURIComponent(), encodedFilter);
    });
  });
});
