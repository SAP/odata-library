"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const ChangeSet = require("../../../../lib/agent/batch/ChangeSet");

describe("agent/batch/Batch", function () {
  let Base;
  let Batch;
  let batch;
  let Request;

  beforeEach(function () {
    let listNameCheck;
    let prefixBoundary;

    Base = function (listName, prefix) {
      listNameCheck = listName;
      prefixBoundary = prefix;
      this.requests = [];
    };

    Request = sinon.stub();

    Batch = proxyquire("../../../../lib/agent/batch/Batch", {
      "./Base": Base,
      "./Request": Request,
      "./ChangeSet": ChangeSet,
    });

    batch = new Batch();
    assert.equal(listNameCheck, "requests");
    assert.equal(prefixBoundary, "batch");
  });

  describe(".addRequest", function () {
    it("Add request to the batch", function () {
      Base.prototype.add = sinon.stub();
      batch.addRequest("HTTP_METHOD", "INPUT_URL", "HEADERS", "PAYLOAD");
      assert.ok(
        Base.prototype.add.calledWith(
          Request,
          "HTTP_METHOD",
          "INPUT_URL",
          "HEADERS",
          "PAYLOAD"
        )
      );
    });
    it("Add request to the changeSet", function () {
      let changeSet = {
        addRequest: sinon.stub(),
      };
      Base.prototype.add = sinon.stub();

      batch.addRequest(
        "HTTP_METHOD",
        "INPUT_URL",
        "HEADERS",
        "PAYLOAD",
        changeSet
      );
      assert.ok(
        changeSet.addRequest.calledWith(
          "HTTP_METHOD",
          "INPUT_URL",
          "HEADERS",
          "PAYLOAD"
        )
      );
      assert.ok(Base.prototype.add.notCalled);
    });
  });

  describe("indexOf", function () {
    it("Invalid type of batchItem raises error", function () {
      assert.throws(() => {
        batch.indexOf({});
      });
    });
    it("Existing batchItem returns index", function () {
      let changeSet = new ChangeSet();
      batch.requests.push(changeSet);
      assert.strictEqual(batch.indexOf(changeSet), 0);
    });
    it("Missing batchItem returns -1", function () {
      batch.requests.push(new ChangeSet());
      assert.strictEqual(batch.indexOf(new ChangeSet()), -1);
    });
  });

  it("createChangeSet", function () {
    sinon.stub(batch, "add").returns("CHANGE_SET");
    assert.strictEqual(batch.createChangeSet(), "CHANGE_SET");
    assert.ok(batch.add.calledWithExactly(ChangeSet));
  });

  it(".payload", function () {
    sinon.stub(batch, "boundary").returns("BOUNDARY");
    batch.requests.push({
      payload: sinon.stub().returns("PAYLOAD_REQUEST_1"),
    });
    batch.requests.push({
      payload: sinon.stub().returns("PAYLOAD_REQUEST_2"),
    });
    assert.strictEqual(
      batch.payload("X-CSRF-TOKEN"),
      [
        "--BOUNDARY",
        "PAYLOAD_REQUEST_1",
        "--BOUNDARY",
        "PAYLOAD_REQUEST_2",
        "--BOUNDARY--",
      ].join("\n")
    );
    assert.ok(batch.requests[0].payload.getCall(0).calledWith("X-CSRF-TOKEN"));
    assert.ok(batch.requests[1].payload.getCall(0).calledWith("X-CSRF-TOKEN"));
  });

  describe(".process", function () {
    let batchResponse;
    beforeEach(function () {
      batchResponse = {
        text: sinon
          .stub()
          .returns(
            Promise.resolve(
              [
                "--batch_AAAA-BBBB-CCCC",
                "BATCH_RESPONSE_1_ROW_1",
                "BATCH_RESPONSE_1_ROW_2",
                "--batch_AAAA-BBBB-CCCC",
                "BATCH_RESPONSE_2_ROW_1",
                "BATCH_RESPONSE_2_ROW_2",
                "--batch_AAAA-BBBB-CCCC--",
              ].join("\n")
            )
          ),
      };
      sinon.stub(batch, "boundaryFromResponse");
    });
    it("Process correct batch response", function () {
      batch.boundaryFromResponse.returns("batch_AAAA-BBBB-CCCC");
      batch.requests.push({
        process: sinon.stub().returns(Promise.resolve("BATCH_RESPONSE_1")),
      });
      batch.requests.push({
        process: sinon.stub().returns(Promise.resolve("BATCH_RESPONSE_2")),
      });
      return batch.process(batchResponse).then((responses) => {
        assert.deepEqual(responses, ["BATCH_RESPONSE_1", "BATCH_RESPONSE_2"]);
        assert.ok(
          batch.requests[0].process
            .getCall(0)
            .calledWithExactly([
              "BATCH_RESPONSE_1_ROW_1",
              "BATCH_RESPONSE_1_ROW_2",
            ])
        );
        assert.ok(
          batch.requests[1].process
            .getCall(0)
            .calledWithExactly([
              "BATCH_RESPONSE_2_ROW_1",
              "BATCH_RESPONSE_2_ROW_2",
            ])
        );
      });
    });
    it("Process invalid batch response", function () {
      return batch.process(batchResponse).catch((err) => {
        assert.ok(err.message.match(/Boundary/));
      });
    });
  });

  describe(".defaultChangeSet", function () {
    it("Missing default changeset", function () {
      assert.strictEqual(batch.defaultChangeSet, undefined);
    });

    it("Existing default changeset", function () {
      batch.requests.push(new Request());
      batch.requests.push(new ChangeSet());
      batch.requests.push(new Batch());
      batch.requests.push(new Batch());
      assert.strictEqual(batch.defaultChangeSet, batch.requests[1]);
    });
  });

  it(".get", function () {
    sinon.stub(batch, "addRequest");
    batch.get("INPUT_URL", "HEADERS", "CHANGE_SET");
    assert.ok(
      batch.addRequest.calledWithExactly(
        "GET",
        "INPUT_URL",
        "HEADERS",
        undefined,
        "CHANGE_SET"
      )
    );
  });

  ["post", "merge", "put"].forEach((methodName) => {
    it("." + methodName, function () {
      sinon.stub(batch, "addRequest");
      batch[methodName](
        "INPUT_URL",
        {
          NAME: "VALUE",
        },
        "PAYLOAD",
        "CHANGE_SET"
      );
      assert.ok(
        batch.addRequest.calledWithExactly(
          methodName.toUpperCase(),
          "INPUT_URL",
          {
            NAME: "VALUE",
            "sap-contextid-accept": "header",
            Accept: "application/json",
            DataServiceVersion: "2.0",
            MaxDataServiceVersion: "2.0",
            "Content-Type": "application/json",
            "sap-message-scope": "BusinessObject",
          },
          "PAYLOAD",
          "CHANGE_SET"
        )
      );
    });
  });

  it(".patch", function () {
    sinon.stub(batch, "addRequestWithPayload").returns("REQUEST");
    batch.patch(
      "INPUT_URL",
      {
        NAME: "VALUE",
      },
      "PAYLOAD",
      "CHANGE_SET"
    );
    assert.ok(
      batch.addRequestWithPayload.calledWith(
        "PATCH",
        "INPUT_URL",
        {
          NAME: "VALUE",
        },
        "PAYLOAD",
        "CHANGE_SET"
      )
    );
  });

  it(".delete", function () {
    sinon.stub(batch, "addRequest");
    batch.delete("INPUT_URL", "HEADERS", "CHANGE_SET");
    assert.ok(
      batch.addRequest.calledWithExactly(
        "DELETE",
        "INPUT_URL",
        "HEADERS",
        undefined,
        "CHANGE_SET"
      )
    );
  });

  it(".addRequestWithPayload", function () {
    sinon.stub(batch, "addRequest").returns("REQUEST");
    assert.strictEqual(
      batch.addRequestWithPayload(
        "HTTP_METHOD",
        "INPUT_URL",
        {
          KEY: "VALUE",
        },
        "PAYLOAD",
        "CHANGE_SET"
      ),
      "REQUEST"
    );
    assert.ok(
      batch.addRequest.calledWithExactly(
        "HTTP_METHOD",
        "INPUT_URL",
        {
          "sap-contextid-accept": "header",
          Accept: "application/json",
          DataServiceVersion: "2.0",
          MaxDataServiceVersion: "2.0",
          "Content-Type": "application/json",
          "sap-message-scope": "BusinessObject",
          KEY: "VALUE",
        },
        "PAYLOAD",
        "CHANGE_SET"
      )
    );
  });

  describe("boundaryFromResponse", function () {
    let batchResponse;

    beforeEach(function () {
      batchResponse = {
        headers: {
          get: sinon.stub(),
        },
      };
    });

    it("invalid content type header", function () {
      assert.equal(batch.boundaryFromResponse(batchResponse), undefined);
      assert.ok(batchResponse.headers.get.calledWithExactly("content-type"));
    });

    it("invalid content type header", function () {
      batchResponse.headers.get.returns("multipart/mixed; boundary=BOUNDARY");
      assert.equal(batch.boundaryFromResponse(batchResponse), "BOUNDARY");
      assert.ok(batchResponse.headers.get.calledWithExactly("content-type"));
    });
  });
});
