"use strict";

const assert = require("assert");
const sinon = require("sinon");
const _ = require("lodash");
const proxyquire = require("proxyquire");

describe("agent/batch/Base", function () {
  let Base;
  let base;

  beforeEach(function () {
    Base = proxyquire("../../../../lib/agent/batch/Base", {});
    base = new Base("batches", "BOUNDARY_PREFIX");
  });

  describe(".constructor", function () {
    it("Missing list name", function () {
      assert.throws(() => {
        base = new Base();
      }, /Invalid/);
    });
    it("Missing boundary prefix", function () {
      base = new Base("batches");
      assert.strictEqual(base.boundaryPrefix, "");
    });
    it("Prefix and list name correctly passed", function () {
      base = new Base("batches", "prefix");
      assert.deepEqual(base.batches, []);
      assert.strictEqual(base.boundaryPrefix, "prefix");
    });
  });

  it(".add", function () {
    let BatchObject = sinon.stub();
    base.add(BatchObject, "ARG1", "ARG2");
    assert.ok(BatchObject.calledWithExactly("ARG1", "ARG2"));
    assert.strictEqual(base.batches.length, 1);
    assert.ok(base.batches[0] instanceof BatchObject);
  });

  it(".generateId", function () {
    assert.strictEqual(base.generateId().length, 12);
    assert.ok(_.isString(base.generateId()));
  });

  it(".boundary", function () {
    sinon.stub(Base.prototype, "generateId").returns("AAAABBBBCCCC");
    base = new Base("batches", "PREFIX");
    assert.strictEqual(base.boundary(), "PREFIX_AAAA-BBBB-CCCC");
  });
});
