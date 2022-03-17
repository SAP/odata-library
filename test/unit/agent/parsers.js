"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("parsers", function () {
  let parsers;

  beforeEach(function () {
    parsers = proxyquire("../../../lib/agent/parsers", {});
  });

  describe('parsers["text/plain"]', function () {
    it("Read chunks join them return as one text", function (done) {
      let res = {
        on: sinon.stub(),
        setEncoding: sinon.stub(),
      };
      parsers["text/plain"](res, (unused, response) => {
        assert.equal(response, "TEXT");
        done();
      });
      setTimeout(() => {
        res.on.getCall(0).args[1]("TEXT");
        res.on.getCall(1).args[1]();
      }, 0);
    });
  });

  describe('#parsers["application/xml"]', function () {
    it("Read chunks join them return XML document converted to javascript object", function (done) {
      let res = {
        on: sinon.stub(),
        setEncoding: sinon.stub(),
      };
      parsers["application/xml"](res, (err, response) => {
        assert.deepEqual(response, {
          tag: {
            _: "CONTENT",
            $: {
              attr: "ATTRIBUTE",
            },
          },
        });
        done();
      });
      setTimeout(() => {
        res.on.getCall(0).args[1]('<tag attr="ATTRIBUTE">');
        res.on.getCall(0).args[1]("CONTENT");
        res.on.getCall(0).args[1]("</tag>");
        res.on.getCall(1).args[1]();
      }, 0);
    });
    it("Returns error ", function (done) {
      let res = {
        on: sinon.stub(),
        setEncoding: sinon.stub(),
      };
      parsers["application/xml"](res, (err) => {
        assert.ok(!!err);
        done();
      });
      setTimeout(() => {
        res.on.getCall(0).args[1]('<tag attr="ATTRIBUTE">');
        res.on.getCall(0).args[1]("CONTENT");
        res.on.getCall(0).args[1]("<tag>");
        res.on.getCall(1).args[1]();
      }, 0);
    });
  });

  describe('parsers["text/html"]', function () {
    it("Read chunks join them return HTML as plain text", function (done) {
      let res = {
        on: sinon.stub(),
        setEncoding: sinon.stub(),
      };
      parsers["text/html"](res, (err, response) => {
        assert.equal(response, "<html><head></head><body></body></html>");
        done();
      });
      setTimeout(() => {
        res.on.getCall(0).args[1]("<html><head></head>");
        res.on.getCall(0).args[1]("<body></body>");
        res.on.getCall(0).args[1]("</html>");
        res.on.getCall(1).args[1]();
      }, 0);
    });
  });

  describe('parsers["application/json"]', function () {
    it("Read chunks join them and return javascript object", function (done) {
      let res = {
        on: sinon.stub(),
        setEncoding: sinon.stub(),
      };
      parsers["application/json"](res, (err, response) => {
        assert.deepEqual(response, {
          result: "RESULT",
        });
        done();
      });
      setTimeout(() => {
        res.on.getCall(0).args[1]("{");
        res.on.getCall(0).args[1]('"result":"RESULT"');
        res.on.getCall(0).args[1]("}");
        res.on.getCall(1).args[1]();
      }, 0);
    });
    it("Receive invalid JSON", function (done) {
      let res = {
        on: sinon.stub(),
        setEncoding: sinon.stub(),
      };
      parsers["application/json"](res, (err) => {
        assert.ok(err);
        done();
      });
      setTimeout(() => {
        res.on.getCall(0).args[1]("{");
        res.on.getCall(0).args[1]('"result":"RESULT"');
        res.on.getCall(1).args[1]();
      }, 0);
    });
  });

  describe("parseBinary()", function () {
    it("Read chunks join them return HTML as plain text", function (done) {
      let res = {
        on: sinon.stub(),
      };
      parsers["application/pdf"](res, (err, response) => {
        assert.equal(response.length, 3);
        done();
      });
      setTimeout(() => {
        res.on.getCall(0).args[1](Buffer.alloc(1));
        res.on.getCall(0).args[1](Buffer.alloc(1));
        res.on.getCall(0).args[1](Buffer.alloc(1));
        res.on.getCall(1).args[1]();
      }, 0);
    });

    it("Use same parser for pdf and xls(x)", function () {
      assert(
        parsers["application/pdf"] === parsers["application/vnd.ms-excel"] &&
          parsers["application/pdf"] ===
            parsers[
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ]
      );
    });
  });

  it(".count()", function () {
    assert.strictEqual(parsers.count("10"), 10);
    assert.strictEqual(parsers.count(10), 10);
    assert.throws(() => {
      parsers.count(null);
    });
  });
});
