"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

let Request;
let Base;
let ChangeSet;
let Response;

let changeSet;

describe("agent/batch/ChangeSet", function () {
  beforeEach(function () {
    let listNameCheck;

    Base = function (listName) {
      listNameCheck = listName;
      this.requests = [];
    };
    Base.prototype.add = sinon.stub();

    Request = sinon.stub();
    Response = function () {
      this.promise = Promise.resolve("PROCESSED_RESPONSE");
    };

    ChangeSet = proxyquire("../../../../lib/agent/batch/ChangeSet", {
      "./Base": Base,
      "./Request": Request,
      "./Response": Response,
    });

    changeSet = new ChangeSet();
    assert.equal(listNameCheck, "requests");
  });

  it(".constructor", function () {
    assert.strictEqual(changeSet.commited, false);
  });

  it(".addRequest", function () {
    changeSet.addRequest();
    assert.ok(Base.prototype.add.calledWith(Request));
  });

  it(".payload", function () {
    sinon.stub(changeSet, "boundary").returns("BOUNDARY");
    changeSet.requests.push({
      payload: sinon.stub().returns("REQUEST_PAYLOAD_1"),
    });
    changeSet.requests.push({
      payload: sinon.stub().returns("REQUEST_PAYLOAD_2"),
    });
    assert.strictEqual(
      changeSet.payload(),
      "Content-Type: multipart/mixed; boundary=BOUNDARY\n\n" +
        "--BOUNDARY\n" +
        "REQUEST_PAYLOAD_1\n" +
        "--BOUNDARY\n" +
        "REQUEST_PAYLOAD_2\n" +
        "--BOUNDARY--"
    );
  });

  describe(".process", function () {
    it("Correctly defined changeset", function () {
      let payload = [
        "Content-Type: multipart/mixed; boundary=changeset_a6be-a5ee-2c7e",
        "",
        "--changeset_a6be-a5ee-2c7e",
        "Content-Type: application/http",
        "Content-Transfer-Encoding: binary",
        "",
        "POST C_AllocationCycleTPActivation?AllocationType='ACDOC_PA' HTTP/1.1",
        "sap-contextid-accept: header",
        "Accept: application/json",
        "Accept-Language: en-US",
        "DataServiceVersion: 2.0",
        "MaxDataServiceVersion: 2.0",
        "x-csrf-token: aD6Cg018rgXrBhhoqJKbnA==",
        "Content-Type: application/json",
        "",
        "--changeset_a6be-a5ee-2c7e",
        "Content-Type: application/http",
        "Content-Transfer-Encoding: binary",
        "",
        "POST C_AllocationCycleTPActivation?AllocationType='ACDOC_CC' HTTP/1.1",
        "sap-contextid-accept: header",
        "Accept: application/json",
        "Accept-Language: en-US",
        "DataServiceVersion: 2.0",
        "MaxDataServiceVersion: 2.0",
        "x-csrf-token: aD6Cg018rgXrBhhoqJKbnA==",
        "Content-Type: application/json",
        "",
        "--changeset_a6be-a5ee-2c7e--",
        "",
      ];

      changeSet.requests.push({
        process: sinon.stub().returns(Promise.resolve()),
      });
      changeSet.requests.push({
        process: sinon.stub().returns(Promise.resolve()),
      });

      return changeSet.process(payload).then(() => {
        assert.ok(
          changeSet.requests[0].process.calledWith([
            "Content-Type: application/http",
            "Content-Transfer-Encoding: binary",
            "",
            "POST C_AllocationCycleTPActivation?AllocationType='ACDOC_PA' HTTP/1.1",
            "sap-contextid-accept: header",
            "Accept: application/json",
            "Accept-Language: en-US",
            "DataServiceVersion: 2.0",
            "MaxDataServiceVersion: 2.0",
            "x-csrf-token: aD6Cg018rgXrBhhoqJKbnA==",
            "Content-Type: application/json",
            "",
          ])
        );
        assert.deepEqual(changeSet.requests[1].process.getCall(0).args[0], [
          "Content-Type: application/http",
          "Content-Transfer-Encoding: binary",
          "",
          "POST C_AllocationCycleTPActivation?AllocationType='ACDOC_CC' HTTP/1.1",
          "sap-contextid-accept: header",
          "Accept: application/json",
          "Accept-Language: en-US",
          "DataServiceVersion: 2.0",
          "MaxDataServiceVersion: 2.0",
          "x-csrf-token: aD6Cg018rgXrBhhoqJKbnA==",
          "Content-Type: application/json",
          "",
        ]);
      });
    });
    it("Missing boundary", function () {
      let payload = [
        "--changeset_a6be-a5ee-2c7e",
        "Content-Type: application/http",
        "Content-Transfer-Encoding: binary",
        "",
        "POST C_AllocationCycleTPActivation?AllocationType='ACDOC_PA' HTTP/1.1",
        "sap-contextid-accept: header",
        "Accept: application/json",
        "Accept-Language: en-US",
        "DataServiceVersion: 2.0",
        "MaxDataServiceVersion: 2.0",
        "x-csrf-token: aD6Cg018rgXrBhhoqJKbnA==",
        "Content-Type: application/json",
        "",
        "--changeset_a6be-a5ee-2c7e",
        "Content-Type: application/http",
        "Content-Transfer-Encoding: binary",
        "--changeset_a6be-a5ee-2c7e--",
        "",
      ];

      changeSet.requests.push({
        process: sinon.stub().returns(Promise.resolve()),
      });
      changeSet.requests.push({
        process: sinon.stub().returns(Promise.resolve()),
      });

      return changeSet.process(payload).then((res) => {
        assert.strictEqual(res, "PROCESSED_RESPONSE");
      });
    });
  });
  it(".commit", function () {
    assert.strictEqual(changeSet.commited, false);
    changeSet.commit();
    assert.strictEqual(changeSet.commited, true);
  });
});
