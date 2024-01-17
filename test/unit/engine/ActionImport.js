"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("ActionImport (engine)", function () {
  let ActionImport;
  let actionImport;
  const importMetadata = "METADATA";
  const action = {
    createDirectCaller: sinon.stub().returns("caller"),
    meta: {
      name: "unknown",
    },
  };

  beforeEach(function () {
    ActionImport = proxyquire("../../../lib/engine/ActionImport", {});
    actionImport = new ActionImport(action, "METADATA");
  });

  it("#constructor()", function () {
    assert.strictEqual(actionImport.action, action);
    assert.strictEqual(actionImport.meta, importMetadata);
  });

  it(".createDirectCaller()", function () {
    const caller = actionImport.createDirectCaller();
    assert.strictEqual(caller, "caller");
    assert.ok(action.createDirectCaller.called);
    assert.deepEqual(action.createDirectCaller.args[0], [
      undefined,
      importMetadata,
    ]);
  });

  it(".fromSchemaAndAction()", function () {
    const schema = {
      getEntityContainer: sinon.stub().returns({
        actionImports: [
          {
            action: {
              name: "ACTION1",
            },
          },
        ],
      }),
    };

    let ai = ActionImport.fromSchemaAndAction(schema, action);
    assert.ok(!ai);

    action.meta.name = "ACTION1";
    ai = ActionImport.fromSchemaAndAction(schema, action);
    assert.ok(ai instanceof ActionImport);
    assert.strictEqual(ai.action, action);
    assert.strictEqual(ai.meta, schema.getEntityContainer().actionImports[0]);
  });
});
