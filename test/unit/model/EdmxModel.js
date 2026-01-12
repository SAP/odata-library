"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const EdmxModel = require("../../../lib/model/EdmxModel");
const NwCsdlSchema = require("../../../lib/model/nw/CsdlSchema");
const OasisCsdlSchema = require("../../../lib/model/oasis/CsdlSchema");

function wrapServices(services) {
  return {
    "edmx:Edmx": {
      $: {
        Version: "1.0",
      },
      "edmx:DataServices": services,
    },
  };
}

const sampleMD = wrapServices([
  {
    Schema: [
      {
        $: {
          Namespace: "ns",
        },
      },
    ],
  },
]);

describe("EdmxModel", function () {
  describe("getService", function () {
    it("returns data service", function () {
      let service = {};
      let actual = EdmxModel.getService(wrapServices([service]));
      assert.strictEqual(actual, service);
    });

    it("throws error on invalid input", function () {
      assert.throws(() => {
        EdmxModel.getService(wrapServices([]));
      });
    });
  });

  describe("#constructor()", function () {
    it("initializes properties", function () {
      let settings = {};
      let model = new EdmxModel(sampleMD, settings);
      assert.strictEqual(model.raw, sampleMD);
      assert.strictEqual(model.version, "1.0");
      assert.equal(model.schemas.length, 1);
      assert.ok(model.schemas[0] instanceof NwCsdlSchema);
      assert.equal(model.schemas[0].settings, settings);
    });

    it("throws error on invalid input", function () {
      assert.throws(() => {
        let x = new EdmxModel(wrapServices([{}]));
        assert.ok(x);
      });
    });
  });

  describe("getSchema()", function () {
    it("finds default schema", function () {
      let model = new EdmxModel(sampleMD);
      assert.strictEqual(model.getSchema(), model.schemas[0]);
    });

    it("finds schema by namespace", function () {
      let model = new EdmxModel(sampleMD);
      assert.strictEqual(model.getSchema("ns"), model.schemas[0]);
    });

    it("returns nothing on invalid namespace", function () {
      let model = new EdmxModel(sampleMD);
      assert.ok(!model.getSchema("nons"));
    });
  });

  describe("merge()", function () {
    it("applies annotations to default model", function () {
      let model = new EdmxModel(sampleMD);
      let model2 = new EdmxModel(sampleMD);
      let applyMethod = sinon.stub(model.getSchema(), "applyAnnotations");
      model.merge(model2);
      assert.ok(applyMethod.called);
    });
  });

  describe("resolveModelPath()", function () {
    it("calls resolveModelPath on appropriate schema", function () {
      let model = new EdmxModel(sampleMD);
      let expected = {};
      let stub = sinon
        .stub(model.getSchema(), "resolveModelPath")
        .returns(expected);
      let actual = model.resolveModelPath("ns.something");
      assert.equal(actual, expected);
      assert.ok(stub.calledWith("ns.something"));
    });

    it("uses default schema on missing namespace", function () {
      let model = new EdmxModel(sampleMD);
      let expected = {};
      let stub = sinon
        .stub(model.getSchema(), "resolveModelPath")
        .returns(expected);
      let actual = model.resolveModelPath("something");
      assert.equal(actual, expected);
      assert.ok(stub.calledWith("something"));
    });

    it("namespace with dots", function () {
      let model = new EdmxModel(
        wrapServices([
          {
            Schema: [
              {
                $: {
                  Namespace: "ns.sn",
                },
              },
            ],
          },
        ])
      );
      let expected = {};
      let stub = sinon
        .stub(model.getSchema(), "resolveModelPath")
        .returns(expected);
      let actual = model.resolveModelPath("ns.sn.something");
      assert.equal(actual, expected);
      assert.ok(stub.called);

      stub.reset();
      model.resolveModelPath("ns.sn.something/something.something/...");
      assert.equal(actual, expected);
      assert.ok(stub.called);
    });

    it("throws on invalid namespace", function () {
      let model = new EdmxModel(sampleMD);
      assert.throws(() => model.resolveModelPath("nothing.something"));
    });
  });

  it("#getSchemaTypeByVersion", function () {
    assert.equal(EdmxModel.getSchemaTypeByVersion("1.0"), NwCsdlSchema);
    assert.equal(EdmxModel.getSchemaTypeByVersion("4.0"), OasisCsdlSchema);
    assert.equal(EdmxModel.getSchemaTypeByVersion("4.01"), OasisCsdlSchema);
    assert.throws(() => {
      EdmxModel.getSchemaTypeByVersion("2.0");
    });
  });
});
