"use strict";

const assert = require("assert");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("settings", function () {
  var settings;
  var fs;

  beforeEach(function () {
    delete process.env.ODATA_URL;
    delete process.env.ODATA_USER;
    delete process.env.ODATA_PASSWORD;
    delete process.env.ODATA_PARAMETERS;
    delete process.env.ODATA_CA_CERT_PATH;
    fs = {};
    settings = proxyquire("../../../lib/agent/settings", {
      fs: fs,
    });
  });
  it("Invalid settings object raises error", function () {
    assert.throws(() => {
      settings(true);
    }, Error);
  });
  it("Missing URL parameter as object variable raises error", function () {
    assert.throws(() => {
      settings({
        auth: {
          username: "uzivatel",
          password: "heslo",
        },
        parameters: {
          client: "902",
          documentation: ["heading", "quickinfo"],
          language: "EN",
        },
      });
    }, Error);
  });
  it("Invalid parameters object raises error", function () {
    process.env.ODATA_PARAMETERS = "{{{";
    assert.throws(() => {
      settings({
        url: "http://localhost/",
      });
    }, Error);
  });
  it("URL as string passed by parameter", function () {
    assert.deepEqual(settings("http://localhost/"), {
      url: "http://localhost/",
      strict: true,
    });
  });
  it("URL as string passed by environment variable ", function () {
    process.env.ODATA_URL = "http://localhost/";
    assert.deepEqual(settings(), {
      url: "http://localhost/",
      strict: true,
    });
  });
  it("URL as string with authorization passed by parameter", function () {
    assert.deepEqual(settings("http://uzivatel:heslo@localhost/"), {
      url: "http://localhost/",
      auth: {
        username: "uzivatel",
        password: "heslo",
      },
      strict: true,
    });
  });
  it("URL as string with authorization passed by environment variable", function () {
    process.env.ODATA_URL = "http://uzivatel:heslo@localhost/";
    assert.deepEqual(settings(), {
      url: "http://localhost/",
      auth: {
        username: "uzivatel",
        password: "heslo",
      },
      strict: true,
    });
  });
  it("Pass metadata parameters over environment variable", function () {
    process.env.ODATA_URL = "http://localhost/";
    process.env.ODATA_PARAMETERS =
      '{"client" : "902", "documentation" : ["heading", "quickinfo"], "language" : "EN", "foo" : "bar"}';

    assert.deepEqual(settings(), {
      url: "http://localhost/",
      parameters: {
        client: "902",
        documentation: ["heading", "quickinfo"],
        language: "EN",
        foo: "bar",
      },
      strict: true,
    });
  });
  it("Define service endpoint by object", function () {
    assert.deepEqual(
      settings({
        url: "http://localhost/",
        annotationsUrl: "http://localhost/anno",
        auth: {
          username: "uzivatel",
          password: "heslo",
        },
        parameters: {
          client: "902",
          documentation: ["heading", "quickinfo"],
          language: "EN",
        },
        logger: console,
        strict: false,
      }),
      {
        url: "http://localhost/",
        annotationsUrl: "http://localhost/anno",
        auth: {
          username: "uzivatel",
          password: "heslo",
        },
        parameters: {
          client: "902",
          documentation: ["heading", "quickinfo"],
          language: "EN",
        },
        logger: console,
        strict: false,
      }
    );
  });
  it("Define service endpoint by object with authorization in url", function () {
    assert.deepEqual(
      settings({
        url: "http://uzivatel:heslo@localhost/",
        parameters: {
          client: "902",
          documentation: ["heading", "quickinfo"],
          language: "EN",
        },
      }),
      {
        url: "http://localhost/",
        auth: {
          username: "uzivatel",
          password: "heslo",
        },
        parameters: {
          client: "902",
          documentation: ["heading", "quickinfo"],
          language: "EN",
        },
        strict: true,
      }
    );
  });
  it("Precedence of URL passed as object before environment variable ", function () {
    process.env.ODATA_URL = "http://localhost/";
    assert.deepEqual(
      settings({
        url: "http://remotehost/",
      }),
      {
        url: "http://remotehost/",
        strict: true,
      }
    );
  });
  it("Precedence of auth passed as object before environment variable ", function () {
    process.env.ODATA_URL = "http://localhost/";
    process.env.ODATA_USER = "uzivatel";
    process.env.ODATA_PASSWORD = "heslo";
    assert.deepEqual(
      settings({
        url: "http://remotehost/",
      }),
      {
        url: "http://remotehost/",
        auth: {
          username: "uzivatel",
          password: "heslo",
        },
        strict: true,
      }
    );
  });
  it("Pass CA by environment variable", function () {
    process.env.ODATA_CA_CERT_PATH = "root.crt";
    fs.readFileSync = sinon.stub();

    fs.readFileSync.returns("CERTIFICATE_CONTENT");
    assert.deepEqual(
      settings({
        url: "http://remotehost/",
      }),
      {
        url: "http://remotehost/",
        ca: "CERTIFICATE_CONTENT",
        strict: true,
      }
    );
  });
  it("Pass CA by object key", function () {
    fs.readFileSync = sinon.stub();

    fs.readFileSync.returns("CERTIFICATE_CONTENT");
    assert.deepEqual(
      settings({
        url: "http://remotehost/",
        caCertPath: "root.crt",
      }),
      {
        url: "http://remotehost/",
        ca: "CERTIFICATE_CONTENT",
        strict: true,
      }
    );

    fs.readFileSync.throws();
    assert.throws(function () {
      settings({
        url: "http://remotehost/",
        caCertPath: "root.crt",
      });
    });
  });
  it("Combine environment variables and object settings", function () {
    process.env.ODATA_URL = "http://localhost/";
    process.env.ODATA_USER = "uzivatel";
    process.env.ODATA_PASSWORD = "heslo";
    assert.deepEqual(
      settings({
        logger: console,
      }),
      {
        url: "http://localhost/",
        auth: {
          username: "uzivatel",
          password: "heslo",
        },
        logger: console,
        strict: true,
      }
    );
  });
});
