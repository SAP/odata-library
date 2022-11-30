"use strict";

const assert = require("assert").strict;
const responseType = require("../../../lib/engine/responseType");

describe("engine/responseType", function () {
  it("#determine()", function () {
    assert.equal(
      responseType.determine({
        _isCount: true,
      }),
      responseType.COUNT
    );
    assert.equal(
      responseType.determine(
        {
          _isList: true,
        },
        {
          entityTypeModel: {},
        }
      ),
      responseType.LIST
    );
    assert.equal(
      responseType.determine(
        {
          _isEntity: true,
        },
        {
          entityTypeModel: {},
        }
      ),
      responseType.ENTITY
    );
    assert.equal(responseType.determine(), undefined);
    assert.equal(
      responseType.determine({
        _isValue: true,
        _isEntity: true,
      }),
      responseType.ENTITY_VALUE
    );
    assert.equal(
      responseType.determine({
        _isValue: true,
        _isEntity: true,
        _valuePropertyName: "PROPERTY_NAME",
      }),
      responseType.PROPERTY_VALUE
    );
  });
});
