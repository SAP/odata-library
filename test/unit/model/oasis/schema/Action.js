"use strict";

const assert = require("assert");
const sinon = require("sinon");
const Action = require("../../../../../lib/model/oasis/schema/Action");
const BoundObject = require("../../../../../lib/model/oasis/schema/BoundObject");
const sandbox = sinon.createSandbox();

const sampleMD = {
  $: {
    Name: "Action1",
    IsBound: "true",
    EntitySetPath: "path",
  },
  Parameter: [
    {
      $: {},
    },
    {
      $: {
        Name: "path",
      },
      type: "boundType",
    },
  ],
  ReturnType: [
    {
      $: {
        Type: "type",
      },
    },
  ],
};

describe("Action", function () {
  let actionType;
  beforeEach(() => {
    actionType = new Action(sampleMD);
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("._checkConsistency()", function () {
    sandbox.stub(BoundObject.prototype, "_checkConsistency");
    actionType._checkConsistency();
    assert.ok(BoundObject.prototype._checkConsistency.args, [[]]);

    actionType.raw.ReturnType = [];
    assert.throws(
      () => actionType._checkConsistency(),
      /Action Action1 may contain at most one ReturnType element/
    );

    actionType.raw.ReturnType = [1, 2];
    assert.throws(
      () => actionType._checkConsistency(),
      /Action Action1 may contain at most one ReturnType element/
    );
  });
});
