"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const EntityType = require("../../../../../lib/model/oasis/schema/EntityType");

describe("EntityType (OASIS) no dependencies", function () {
  let type;
  let rawMetadata;
  let metaModel;
  beforeEach(function () {
    metaModel = {};
    rawMetadata = {
      $: {
        Name: "NAME",
      },
    };
    type = new EntityType(rawMetadata, metaModel);
  });

  it("#constructor()", function () {
    sinon.stub(type, "_createKey").returns("KEY");
    assert.equal(type.key, "KEY");
    assert.equal(type.key, "KEY");
    assert.ok(type._createKey.calledOnce);
    assert.ok(type._createKey.calledWith(metaModel));
  });

  describe(".createKey()", function () {
    it("local key definition", function () {
      sinon.stub(type, "getProperty").returns("PROPERTY_INSTANCE");
      rawMetadata.Key = [
        {
          PropertyRef: [
            {
              $: "PROPERTY_NAME",
            },
          ],
        },
      ];
      assert.deepEqual(type._createKey(metaModel), ["PROPERTY_INSTANCE"]);
    });
    it("base type key definition", function () {
      metaModel.resolveModelPath = sinon.stub().returns({
        key: ["BASE_PROPERTY_INSTANCE"],
      });
      rawMetadata.$.BaseType = "BASE_TYPE";
      assert.deepEqual(type._createKey(metaModel), ["BASE_PROPERTY_INSTANCE"]);
    });

    it("Invalid key definition", function () {
      sinon.stub(type, "isValidKeyDefinition").returns(true);
      assert.throws(() => {
        type._createKey(metaModel);
      });
    });
  });

  it(".isValidKeyDefinition()", function () {
    [
      {
        args: ["BaseType", null],
        result: true,
      },
      {
        args: [null, ["KEY_DEF"]],
        result: true,
      },
      {
        args: [null, null],
        result: false,
      },
    ].forEach((testCase) => {
      assert.equal(
        type.isValidKeyDefinition(...testCase.args),
        testCase.result
      );
    });
  });
});
