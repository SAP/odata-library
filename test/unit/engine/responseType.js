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
    assert.equal(
      responseType.determine(
        {
          _isList: true,
        },
        {
          entityTypeModel: {
            hasStream: true,
          },
        }
      ),
      responseType.LIST_STREAM
    );
    assert.equal(
      responseType.determine(
        {
          _isEntity: true,
        },
        {
          entityTypeModel: {
            hasStream: true,
          },
        }
      ),
      responseType.ENTITY_STREAM
    );
    assert.equal(responseType.determine(), undefined);
  });
});
