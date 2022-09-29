"use strict";

const assert = require("assert").strict;
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const sandbox = sinon.createSandbox();

describe("settings", function () {
  let settings;
  let fs;

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

  afterEach(function () {
    sandbox.restore();
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

  it("Combine environment variables and object settings", function () {
    sandbox.spy(settings._, "parseTLSDefinitions");
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
    assert.ok(settings._.parseTLSDefinitions.called);
  });

  describe("_.parseConnectionCookie", () => {
    let parameters;
    let settingsObject;
    beforeEach(() => {
      settingsObject = {
        auth: {
          cookies: ["COOKIE"],
        },
      };
      parameters = {};
      sandbox.stub(settings._, "checkCookieSettings").returns(true);
    });
    it("get cookie from settings", () => {
      settings._.parseConnectionCookie(settingsObject, parameters);
      assert.deepEqual(parameters, {
        auth: {
          cookies: ["COOKIE"],
          type: "cookie",
        },
      });
      assert.ok(
        settings._.checkCookieSettings.calledWithExactly(settingsObject)
      );
    });
    it("get cookie from environment", () => {
      delete settingsObject.auth.cookies;
      process.env.ODATA_COOKIE = "ENV_COOKIE";
      settings._.parseConnectionCookie(settingsObject, parameters);
      assert.deepEqual(parameters, {
        auth: {
          cookies: ["ENV_COOKIE"],
          type: "cookie",
        },
      });
      assert.ok(
        settings._.checkCookieSettings.calledWithExactly(settingsObject)
      );
    });
    it("get cookie list from environment", () => {
      delete settingsObject.auth.cookies;
      process.env.ODATA_COOKIE = '["ENV_COOKIE", "ENV_COOKIE"]';
      settings._.parseConnectionCookie(settingsObject, parameters);
      assert.deepEqual(parameters, {
        auth: {
          cookies: ["ENV_COOKIE", "ENV_COOKIE"],
          type: "cookie",
        },
      });
      assert.ok(
        settings._.checkCookieSettings.calledWithExactly(settingsObject)
      );
    });
    it("constructor settings precede environment", () => {
      process.env.ODATA_COOKIE = "ENV_COOKIE";
      settings._.parseConnectionCookie(settingsObject, parameters);
      assert.deepEqual(parameters, {
        auth: {
          cookies: ["COOKIE"],
          type: "cookie",
        },
      });
      assert.ok(
        settings._.checkCookieSettings.calledWithExactly(settingsObject)
      );
    });
    it("raise error on invalid cookie definition", () => {
      settings._.checkCookieSettings.returns(false);
      assert.throws(() => {
        settings._.parseConnectionCookie(settingsObject, parameters);
      });
    });
  });

  it("_.checkCookieSettings", () => {
    assert.equal(settings._.checkCookieSettings({}), true);
    assert.equal(
      settings._.checkCookieSettings({ auth: { cookies: ["cookie"] } }),
      true
    );
    assert.equal(
      settings._.checkCookieSettings({ auth: { cookies: {} } }),
      false
    );
    assert.equal(
      settings._.checkCookieSettings({ auth: { cookies: true } }),
      false
    );
    process.env.ODATA_COOKIE = "ENV_COOKIE";
    assert.equal(settings._.checkCookieSettings({}), true);
    process.env.ODATA_COOKIE = '["ENV_COOKIE", "ENV_COOKIE"]';
    assert.equal(settings._.checkCookieSettings({}), true);
    process.env.ODATA_COOKIE = '{"ENV_COOKIE", "ENV_COOKIE"}';
    assert.equal(settings._.checkCookieSettings({}), true);
  });

  describe("_.determineTLSDefinition", function () {
    it("PEM object settings", function () {
      assert.deepEqual(
        settings._.determineTLSDefinition(settings.AUTH.CERT, {
          auth: {
            cert: "CERT",
            key: "KEY",
            ca: "CA",
          },
        }),
        Object.assign(
          {
            key: "PEM_OBJECT_KEYS",
            source: {
              auth: {
                cert: "CERT",
                key: "KEY",
                ca: "CA",
              },
            },
          },
          settings.AUTH.CERT.PEM_OBJECT_KEYS
        )
      );
      assert.deepEqual(
        settings._.determineTLSDefinition(settings.AUTH.CERT, {
          auth: {
            cert: "CERT",
            key: "KEY",
          },
        }),
        Object.assign(
          {
            key: "PEM_OBJECT_KEYS",
            source: {
              auth: {
                cert: "CERT",
                key: "KEY",
              },
            },
          },
          settings.AUTH.CERT.PEM_OBJECT_KEYS
        )
      );
      assert.deepEqual(
        settings._.determineTLSDefinition(settings.AUTH.CERT, {
          auth: {
            key: "KEY",
          },
        }),
        Object.assign(
          {
            key: "PEM_OBJECT_KEYS",
            source: {
              auth: {
                key: "KEY",
              },
            },
          },
          settings.AUTH.CERT.PEM_OBJECT_KEYS
        )
      );
      assert.deepEqual(
        settings._.determineTLSDefinition(settings.AUTH.CERT, {
          auth: {
            cert: "CERT",
          },
        }),
        Object.assign(
          {
            key: "PEM_OBJECT_KEYS",
            source: {
              auth: {
                cert: "CERT",
              },
            },
          },
          settings.AUTH.CERT.PEM_OBJECT_KEYS
        )
      );
    });
    it("PFX object settings ", function () {
      assert.deepEqual(
        settings._.determineTLSDefinition(settings.AUTH.CERT, {
          auth: {
            pfx: "PFX",
            passphrase: "PASSPHRASE",
            ca: "CA",
          },
        }),
        Object.assign(
          {
            key: "PFX_OBJECT_KEYS",
            source: {
              auth: {
                pfx: "PFX",
                passphrase: "PASSPHRASE",
                ca: "CA",
              },
            },
          },
          settings.AUTH.CERT.PFX_OBJECT_KEYS
        )
      );
      assert.deepEqual(
        settings._.determineTLSDefinition(settings.AUTH.CERT, {
          auth: {
            pfx: "PFX",
            passphrase: "PASSPHRASE",
          },
        }),
        Object.assign(
          {
            key: "PFX_OBJECT_KEYS",
            source: {
              auth: {
                pfx: "PFX",
                passphrase: "PASSPHRASE",
              },
            },
          },
          settings.AUTH.CERT.PFX_OBJECT_KEYS
        )
      );
      assert.deepEqual(
        settings._.determineTLSDefinition(settings.AUTH.CERT, {
          auth: {
            pfx: "PFX",
          },
        }),
        Object.assign(
          {
            key: "PFX_OBJECT_KEYS",
            source: {
              auth: {
                pfx: "PFX",
              },
            },
          },
          settings.AUTH.CERT.PFX_OBJECT_KEYS
        )
      );
      assert.deepEqual(
        settings._.determineTLSDefinition(settings.AUTH.CERT, {
          auth: {
            passphrase: "PASSPHRASE",
          },
        }),
        Object.assign(
          {
            key: "PFX_OBJECT_KEYS",
            source: {
              auth: {
                passphrase: "PASSPHRASE",
              },
            },
          },
          settings.AUTH.CERT.PFX_OBJECT_KEYS
        )
      );
    });
    it("PEM environment settings ", function () {
      assert.deepEqual(
        settings._.determineTLSDefinition(
          settings.AUTH.CERT,
          {},
          {
            ODATA_CLIENT_CERT: "CERT",
            ODATA_CLIENT_KEY: "KEY",
            ODATA_EXTRA_CA: "CA",
          }
        ),
        Object.assign(
          {
            key: "PEM_ENVIRONMENT_KEYS",
            source: {
              ODATA_CLIENT_CERT: "CERT",
              ODATA_CLIENT_KEY: "KEY",
              ODATA_EXTRA_CA: "CA",
            },
          },
          settings.AUTH.CERT.PEM_ENVIRONMENT_KEYS
        )
      );
      assert.deepEqual(
        settings._.determineTLSDefinition(
          settings.AUTH.CERT,
          {},
          {
            ODATA_CLIENT_CERT: "CERT",
            ODATA_CLIENT_KEY: "KEY",
          }
        ),
        Object.assign(
          {
            key: "PEM_ENVIRONMENT_KEYS",
            source: {
              ODATA_CLIENT_CERT: "CERT",
              ODATA_CLIENT_KEY: "KEY",
            },
          },
          settings.AUTH.CERT.PEM_ENVIRONMENT_KEYS
        )
      );
      assert.deepEqual(
        settings._.determineTLSDefinition(
          settings.AUTH.CERT,
          {},
          {
            ODATA_CLIENT_CERT: "CERT",
          }
        ),
        Object.assign(
          {
            key: "PEM_ENVIRONMENT_KEYS",
            source: {
              ODATA_CLIENT_CERT: "CERT",
            },
          },
          settings.AUTH.CERT.PEM_ENVIRONMENT_KEYS
        )
      );
      assert.deepEqual(
        settings._.determineTLSDefinition(
          settings.AUTH.CERT,
          {},
          {
            ODATA_CLIENT_KEY: "KEY",
          }
        ),
        Object.assign(
          {
            key: "PEM_ENVIRONMENT_KEYS",
            source: {
              ODATA_CLIENT_KEY: "KEY",
            },
          },
          settings.AUTH.CERT.PEM_ENVIRONMENT_KEYS
        )
      );
    });
    it("CA only object settings", function () {
      assert.deepEqual(
        settings._.determineTLSDefinition(
          settings.AUTH.CERT,
          { auth: { ca: "CA" } },
          { ODATA_EXTRA_CA: "CA" }
        ),
        {
          key: "CA_OBJECT_KEYS",
          source: { auth: { ca: "CA" } },
          ORDER: 4,
          SOURCE: "SETTINGS",
          MANDATORY_KEYS: ["auth.ca"],
          OPTIONAL_KEYS: [],
        }
      );
    });
    it("CA only environment settings", function () {
      assert.deepEqual(
        settings._.determineTLSDefinition(
          settings.AUTH.CERT,
          {},
          { ODATA_EXTRA_CA: "CA" }
        ),
        {
          key: "CA_ENVIRONMENT_KEYS",
          source: { ODATA_EXTRA_CA: "CA" },
          ORDER: 5,
          SOURCE: "ENV",
          MANDATORY_KEYS: ["ODATA_EXTRA_CA"],
          OPTIONAL_KEYS: [],
          CONVERSION: { ODATA_EXTRA_CA: "auth.ca" },
        }
      );
    });
    it("missing SSL settings", function () {
      assert.deepEqual(
        settings._.determineTLSDefinition(settings.AUTH.CERT, {}, {}),
        undefined
      );
    });
  });

  describe("_._.checkTLSDefinition", function () {
    it("definition not found (nothing to check)", function () {
      assert.strictEqual(
        settings._.checkTLSDefinition(
          undefined,
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          "PARAMETERS"
        ),
        undefined
      );
    });
    it("found SSL definition without https", function () {
      assert.ok(
        settings._.checkTLSDefinition(
          {},
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          {}
        ).message.match("HTTPS")
      );
    });
    it("found SSL definition without https", function () {
      assert.ok(
        settings._.checkTLSDefinition(
          {
            MANDATORY_KEYS: ["keyA", "keyB"],
            source: {
              keyA: "A",
            },
          },
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          {
            url: "https://localhost",
          }
        ).message.match("keyB")
      );
    });
  });

  describe("_.parseTLSDefinitions", function () {
    beforeEach(function () {
      sandbox.stub(settings._, "determineTLSDefinition");
      sandbox.stub(settings._, "checkTLSDefinition");
    });
    it("TLS definition is not defined", function () {
      assert.deepEqual(
        settings._.parseTLSDefinitions(
          "TEMPLATE_DEFINITIONS",
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          {}
        ),
        {}
      );
      assert.ok(
        settings._.determineTLSDefinition.calledWithExactly(
          "TEMPLATE_DEFINITIONS",
          "CONNECTION_SETTINGS",
          "PROCESS_ENV"
        )
      );
      assert.ok(
        settings._.checkTLSDefinition.calledWithExactly(
          undefined,
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          {}
        )
      );
    });
    it("TLS definition is not valid", function () {
      settings._.determineTLSDefinition.returns("DEFINITION");
      settings._.checkTLSDefinition.returns(new Error());
      assert.throws(() =>
        settings._.parseTLSDefinitions(
          "TEMPLATE_DEFINITIONS",
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          {}
        )
      );
      assert.ok(
        settings._.determineTLSDefinition.calledWithExactly(
          "TEMPLATE_DEFINITIONS",
          "CONNECTION_SETTINGS",
          "PROCESS_ENV"
        )
      );
      assert.ok(
        settings._.checkTLSDefinition.calledWithExactly(
          "DEFINITION",
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          {}
        )
      );
    });
    it("only mandatory keys found", function () {
      settings._.determineTLSDefinition.returns({
        source: {
          auth: {
            cert: "CERT",
            key: "KEY",
          },
        },
        MANDATORY_KEYS: ["auth.cert", "auth.key"],
        OPTIONAL_KEYS: ["auth.ca"],
      });
      assert.deepEqual(
        settings._.parseTLSDefinitions(
          "TEMPLATE_DEFINITIONS",
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          {}
        ),
        {
          auth: {
            cert: "CERT",
            key: "KEY",
          },
        }
      );
    });
    it("with optional keys", function () {
      settings._.determineTLSDefinition.returns({
        source: {
          auth: {
            cert: "CERT",
            key: "KEY",
            ca: "CA",
          },
        },
        MANDATORY_KEYS: ["auth.cert", "auth.key"],
        OPTIONAL_KEYS: ["auth.ca"],
      });
      assert.deepEqual(
        settings._.parseTLSDefinitions(
          "TEMPLATE_DEFINITIONS",
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          {}
        ),
        {
          auth: {
            cert: "CERT",
            key: "KEY",
            ca: "CA",
          },
        }
      );
    });
    it("with converted key names", function () {
      settings._.determineTLSDefinition.returns({
        source: {
          ODATA_CLIENT_CERT: "CERT",
          ODATA_CLIENT_KEY: "KEY",
          ODATA_EXTRA_CA: "CA",
        },
        MANDATORY_KEYS: ["ODATA_CLIENT_CERT", "ODATA_CLIENT_KEY"],
        OPTIONAL_KEYS: ["ODATA_EXTRA_CA"],
        CONVERSION: {
          ODATA_CLIENT_CERT: "auth.cert",
          ODATA_CLIENT_KEY: "auth.key",
          ODATA_EXTRA_CA: "auth.ca",
        },
        ADDITIONAL_KEYS: {
          "auth.type": "cert",
        },
      });
      assert.deepEqual(
        settings._.parseTLSDefinitions(
          "TEMPLATE_DEFINITIONS",
          "CONNECTION_SETTINGS",
          "PROCESS_ENV",
          {}
        ),
        {
          auth: {
            type: "cert",
            cert: "CERT",
            key: "KEY",
            ca: "CA",
          },
        }
      );
    });
  });
});
