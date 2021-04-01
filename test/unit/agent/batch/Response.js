"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const _ = require("lodash");

describe("agent/batch/Response", function () {
  let response;
  let Response;
  let HTTPParser;
  let parsers;

  beforeEach(function () {
    HTTPParser = function () {};
    parsers = {};

    Response = proxyquire("../../../../lib/agent/batch/Response", {
      "http-parser-js": {
        HTTPParser: HTTPParser,
      },
      "../parsers": parsers,
    });

    sinon.stub(Response.prototype, "process");
    response = new Response("RAW_RESPONSE");

    assert.ok(response.process.calledWith("RAW_RESPONSE"));
    Response.prototype.process.restore();
  });

  it(".constructor", function () {
    assert.ok(response.promise instanceof Promise);
    assert.ok(_.isFunction(response.resolve));
    assert.ok(_.isFunction(response.reject));
  });

  describe(".process", function () {
    it("Process valid HTTP response", function () {
      let parser;

      HTTPParser.prototype.execute = sinon.spy();
      HTTPParser.prototype.finish = sinon.spy();
      sinon.stub(response, "parseDivideResponse").returns({
        rawHTTPResponse: ["HTTP_RESPONSE_ROW_1", "HTTP_RESPONSE_ROW_2"],
      });
      sinon.stub(response, "finishProcessResponse");

      parser = response.process("RAW_RESPONSE");

      assert.ok(response.parseDivideResponse.calledWith("RAW_RESPONSE"));
      assert.deepEqual(response.rawHTTPResponse, [
        "HTTP_RESPONSE_ROW_1",
        "HTTP_RESPONSE_ROW_2",
      ]);
      assert.equal(parser.onBody.name, "bound handlerBody");
      assert.equal(
        parser.onHeadersComplete.name,
        "bound handlerHeadersComplete"
      );
      assert.equal(
        parser.onMessageComplete.name,
        "bound handlerMessageComplete"
      );
      assert.equal(
        HTTPParser.prototype.execute.getCall(0).args.toString(),
        "HTTP_RESPONSE_ROW_1\nHTTP_RESPONSE_ROW_2"
      );
      assert.ok(HTTPParser.prototype.finish.called);
      assert.ok(response.finishProcessResponse.notCalled);
    });
    it("Process valid HTTP response and remove content-length header", function () {
      let parser;

      HTTPParser.prototype.execute = sinon.spy();
      HTTPParser.prototype.finish = sinon.spy();
      sinon.stub(response, "parseDivideResponse").returns({
        rawHTTPResponse: [
          "HTTP_RESPONSE_ROW_1",
          "HTTP_RESPONSE_ROW_2",
          "Content-Length: 1000",
          "content-length: 1000",
        ],
      });
      sinon.stub(response, "finishProcessResponse");

      parser = response.process("RAW_RESPONSE");

      assert.ok(response.parseDivideResponse.calledWith("RAW_RESPONSE"));
      assert.deepEqual(response.rawHTTPResponse, [
        "HTTP_RESPONSE_ROW_1",
        "HTTP_RESPONSE_ROW_2",
        "Content-Length: 1000",
        "content-length: 1000",
      ]);
      assert.equal(parser.onBody.name, "bound handlerBody");
      assert.equal(
        parser.onHeadersComplete.name,
        "bound handlerHeadersComplete"
      );
      assert.equal(
        parser.onMessageComplete.name,
        "bound handlerMessageComplete"
      );
      assert.equal(
        HTTPParser.prototype.execute.getCall(0).args.toString(),
        "HTTP_RESPONSE_ROW_1\nHTTP_RESPONSE_ROW_2"
      );
      assert.ok(HTTPParser.prototype.finish.called);
      assert.ok(response.finishProcessResponse.notCalled);
    });
    it("Process invalid HTTP response", function () {
      let parser;
      let error = new Error();

      HTTPParser.prototype.execute = sinon.stub().throws(error);
      sinon.stub(response, "parseDivideResponse").returns({
        rawHTTPResponse: ["HTTP_RESPONSE_ROW_1", "HTTP_RESPONSE_ROW_2"],
      });

      parser = response.process("RAW_RESPONSE");

      assert.ok(response.parseDivideResponse.calledWith("RAW_RESPONSE"));
      assert.deepEqual(response.rawHTTPResponse, [
        "HTTP_RESPONSE_ROW_1",
        "HTTP_RESPONSE_ROW_2",
      ]);
      assert.equal(parser.onBody.name, "bound handlerBody");
      assert.equal(
        parser.onHeadersComplete.name,
        "bound handlerHeadersComplete"
      );
      assert.equal(
        parser.onMessageComplete.name,
        "bound handlerMessageComplete"
      );
      assert.equal(
        HTTPParser.prototype.execute.getCall(0).args.toString(),
        "HTTP_RESPONSE_ROW_1\nHTTP_RESPONSE_ROW_2"
      );

      return response.promise.catch((err) => {
        assert.ok(err.message.match(/Unexpected/));
      });
    });
    it("Process valid HTTP response without body", function () {
      let parser;

      HTTPParser.prototype.execute = function () {
        this.state = "HEADER";
        this.info = {
          statusCode: "STATUS_CODE",
        };
      };
      sinon.spy(HTTPParser.prototype, "execute");
      HTTPParser.prototype.finish = sinon.spy();
      sinon.stub(response, "parseDivideResponse").returns({
        rawHTTPResponse: ["HTTP_RESPONSE_ROW_1", "HTTP_RESPONSE_ROW_2"],
      });
      sinon.stub(response, "finishProcessResponse");

      parser = response.process("RAW_RESPONSE");

      assert.ok(response.parseDivideResponse.calledWith("RAW_RESPONSE"));
      assert.deepEqual(response.rawHTTPResponse, [
        "HTTP_RESPONSE_ROW_1",
        "HTTP_RESPONSE_ROW_2",
      ]);
      assert.equal(parser.onBody.name, "bound handlerBody");
      assert.equal(
        parser.onHeadersComplete.name,
        "bound handlerHeadersComplete"
      );
      assert.equal(
        parser.onMessageComplete.name,
        "bound handlerMessageComplete"
      );
      assert.equal(
        HTTPParser.prototype.execute.getCall(0).args.toString(),
        "HTTP_RESPONSE_ROW_1\nHTTP_RESPONSE_ROW_2"
      );
      assert.ok(HTTPParser.prototype.finish.called);
      assert.ok(response.finishProcessResponse.calledWith("STATUS_CODE"));
    });
  });

  it(".parseDivideResponse", function () {
    assert.deepEqual(
      response.parseDivideResponse(["ROW1", "", "ROW2", "", "ROW3"]),
      {
        rawHTTPResponse: ["ROW2", "", "ROW3"],
        rawMIMEHeaders: ["ROW1"],
      }
    );
  });

  describe(".getContentType", function () {
    _.each(
      [
        {
          headers: {},
          result: null,
          desc: "Empty results",
        },
        {
          headers: {
            Accept: "application/json",
          },
          result: null,
          desc: "Missing content type header",
        },
        {
          headers: {
            "content-type": "application/json",
          },
          result: "application/json",
          desc: "Content type header in lower case",
        },
        {
          headers: {
            "Content-Type": "application/pdf",
          },
          result: "application/pdf",
          desc: "Content type header in camel case",
        },
        {
          headers: {
            "content-type": "application/json;text/html; charset=utf-8",
          },
          result: "application/json",
          desc: "Content type header in lower case",
        },
      ],
      (testCase) => {
        it(testCase.desc, function () {
          response.headers = testCase.headers;
          assert.strictEqual(response.getContentType(), testCase.result);
        });
      }
    );
  });

  it(".getBodyParser", function () {
    parsers["application/json"] = "JSON_PARSER";
    sinon.stub(response, "getContentType").returns("application/json");
    assert.strictEqual(response.getBodyParser(), "JSON_PARSER");
    response.getContentType.returns("none/existing");
    assert.strictEqual(response.getBodyParser(), undefined);
  });

  describe(".handlerParserFinished", function () {
    it("Parsed with error", function () {
      response.handlerParserFinished("ERROR");
      return response.promise
        .then((result) => {
          assert.strictEqual(result, "ERROR");
        })
        .catch(() => assert.ok(false));
    });
    it("Response inside batch returns error code", function () {
      response.statusCode = 400;
      response.handlerParserFinished(null, "CONTENT");
      return response.promise
        .then((result) => {
          assert.equal(response.body, "CONTENT");
          assert.ok(result.message.match(/^400/));
        })
        .catch(() => assert.ok(false));
    });
    it("Response is correct", function () {
      response.statusCode = 200;
      response.handlerParserFinished(null, "CONTENT");
      return response.promise
        .then((res) => {
          assert.equal(res.body, "CONTENT");
          assert.strictEqual(response, res);
        })
        .catch(() => assert.ok(false));
    });
  });

  describe(".useBodyParser", function () {
    it("Parser for content type exists", function () {
      let bodyParser = sinon.spy();
      response.useBodyParser(bodyParser);
      assert.strictEqual(bodyParser.getCall(0).args[0], response);
      assert.strictEqual(
        bodyParser.getCall(0).args[1].name,
        "bound handlerParserFinished"
      );
    });
    it("Parser not found", function () {
      sinon.stub(response, "on");
      response.useBodyParser();
      assert.strictEqual(response.on.getCall(0).args[0], "end");
      assert.strictEqual(
        response.on.getCall(0).args[1].name,
        "bound handlerParserFinished"
      );
    });
  });

  it(".handlerHeadersComplete", function () {
    sinon.stub(response, "useBodyParser");
    sinon.stub(response, "getBodyParser").returns("BODY_PARSER");
    response.handlerHeadersComplete({
      headers: [
        "HEADER_KEY_1",
        "HEADER_VALUE_1",
        "HEADER_KEY_2",
        "HEADER_VALUE_2",
      ],
    });
    assert.deepEqual(response.rawHeaders, [
      "HEADER_KEY_1",
      "HEADER_VALUE_1",
      "HEADER_KEY_2",
      "HEADER_VALUE_2",
    ]);
    assert.deepEqual(response.headers, {
      HEADER_KEY_1: "HEADER_VALUE_1",
      HEADER_KEY_2: "HEADER_VALUE_2",
    });
    assert.ok(response.useBodyParser.calledWith("BODY_PARSER"));
    assert.ok(response.getBodyParser.called);
  });

  it(".handlerBody", function () {
    let data = {
      toString: sinon.stub().returns("DATA_AS_STRING"),
    };
    sinon.stub(response, "emit");
    response.handlerBody(data, "OFFSET", "LENGTH");
    assert.ok(response.emit.calledWith("data", "DATA_AS_STRING"));
    assert.ok(data.toString.calledWith("binary", "OFFSET", "OFFSETLENGTH"));
  });

  it(".handlerMessageComplete", function () {
    sinon.stub(response, "emit");
    response.handlerMessageComplete();
    assert.ok(response.emit.calledWith("end"));
  });

  describe(".finishProcessResponse", function () {
    it("correclty resolve for status code less than 400", function () {
      response.finishProcessResponse(200);
      return response.promise.then((result) =>
        assert.strictEqual(result, response)
      );
    });
    it("reject response for status code greather than or equal to 400", function () {
      response.finishProcessResponse(400);
      return response.promise
        .then((error) => assert.ok(error.message.match(/^400/)))
        .catch(() => assert.ok(false));
    });
    it("reject response for status code greather than or equal to 400 with additional message", function () {
      response.finishProcessResponse(400, "MESSAGE");
      return response.promise
        .then((error) => assert.ok(error.message.match(/MESSAGE/)))
        .catch(() => assert.ok(false));
    });
  });
});
