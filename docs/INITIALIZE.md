# Client initialization

## Initialize by URL

You can pass url with (or without) authorization in one string in the code.

```javascript
const service = new Service(
  "https://username:password@localhost/path/to/service/"
);

service.init.then(() => {
  //Code
});
```

## Initialize by environment variables

You can pass url and authorization by the environment variables and then call
Service without any parameters

```bash
export ODATA_URL="http://localhost:3000/"
export ODATA_USER=UZIVATEL
export ODATA_PASSWORD=tajN3hes10
export ODATA_PARAMETERS='{"sap-client":"902","sap-documentation":["heading", "quickinfo"],"sap-language":"EN"}'
```

```javascript
const service = new Service();

service.init.then(() => {
  //Code
});
```

## Initialize by object

You can pass url and othere settings by object passed to the Service constructor.
You can also combine definitions. The parameter definition has precedence before
definitons in the environment variables.

```javascript
const service = new Service({
  url: "https://localhost/service/",
  annotationsUrl: "https://localhost/serviceMetadata/annotations",
  auth: {
    type: "basic"
    username: "foo",
    password: "bar",
  },
  parameters: {
    //Define initial request by $metadata?sap-client=902&sap-documentation=&sap-language=EN
    "sap-client": "902",
    "sap-documentation": ["heading", "quickinfo"],
    "sap-language": "EN",
  },
  strict: false, // ignore non critical errors, e.g. orphaned annotations
});

service.init.then(() => {
  //Code
});
```

## Authentication types

The odata-library currently support four authentication types.

- none - authentication is not needed
- basic - [use basic access authentication](https://en.wikipedia.org/wiki/Basic_access_authentication)
- samlSap - specific authentication for sap based services
- cookie - run authentication code externally and just pass authentication cookies to odata-library
- cert - pass client certificate in PEM format
- headers - directly set authentication headers

If authentication type is not specified odata-library tries to use first three authentication
types automatically.

### Client certificate authentication

The client certificate settings are passed to [https.Agent](https://nodejs.org/api/https.html#class-httpsagent) which is used

inside odata-library too handle HTTP requests.

Pass client certificate by Service constructor in PEM format. "ca" parameter is used for
certificates signed by certification authoritity which is not inside Node js certificate
authority store.

```javascript
const service = new Service({
  url: "https://localhost/service/",
  auth: {
    ca: fs.readFileSync("path/to/ca.pem"),
    cert: fs.readFileSync("path/to/clientCert.pem"),
    key: fs.readFileSync("path/to/clientKe.pem"),
  },
});

service.init.then(() => {
  //Code
});
```

Set PEM certificate and by environment variables.

```shell
export ODATA_CLIENT_CERT="-----BEGIN CERTIFICATE-----....."
export ODATA_CLIENT_KEY="-----BEGIN RSA PRIVATE KEY-----....."
export ODATA_EXTRA_CA="-----BEGIN CERTIFICATE-----....."
```

Pass client certificate by Service constructor in PFX format

```javascript
const service = new Service({
  url: "https://localhost/service/",
  auth: {
    pfx: fs.readFileSync("path/to/cert.pfx"),
    passphrase: "secretphrase",
  },
});
```

#### How to convert certificates from PFX to PEM

If you would like to use PEM format (typically for settings by shell environment).
Use `openssl` to convert the p12 to PEM format.

```shell
openssl pkcs12 -in i332698.p12 -out i332698.client.pem -clcerts -nokeys
openssl pkcs12 -in i332698.p12 -out i332698.key.pem -nocerts -nodes
```

You need also append certificate chain for certificates which is not signed by
root certificates in Mozilla certificate store (which is included in node)

```shell
openssl pkcs12 -in i332698.p12 -out i332698.ca.pem -cacerts -nokeys
```

## TLS/SSL server certificate

We would like to connect to web server with untrusted TLS certificate some times
for testing reasons. To ignore untrusted certificate you could set environment
variable in this case.

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0;
```

If you have certificate signed by authority which is not in OS repository
pass root certificate to the service.

```shell
export NODE_EXTRA_CA_CERTS=/etc/ssl/certificates/root.crt

```

You can pass additional certificate authority certificate

```javascript
const service = new Service({
  url: "https://localhost/service/",
  annotationsUrl: "https://localhost/serviceMetadata/annotations",
  auth: {
    type: "basic"
    username: "foo",
    password: "bar",
    ca: fs.readFileSync("/path/to/additional.ca.pem")
  },
  strict: false, // ignore non critical errors, e.g. orphaned annotations
});
```

### Cookie authentication

Handle authorization process outside of the odata-library and pass authorization cookie
to odata-library service.

Set cookie via environment variable

```shell
export ODATA_COOKIE="JSESSIONID=s:bdzps02ARlShtevVcSWsTLptzhPdAF-y.r2nlOcl38jriMxfIhcvIzyFwS0V9nITPUz8orkAHMic"
```

More than one cookie by JSON string

```shell
export ODATA_COOKIE='["JSESSIONID=s:bdzps02ARlShtevVcSWsTLptzhPdAF-y.r2nlOcl38jriMxfIhcvIzyFwS0V9nITPUz8orkAHMic", "language=cz"]'
```

Set cookie via constructor

```javascript
const service = new Service({
  url: "https://localhost/service/",
  auth: {
    cookies: [
      "JSESSIONID=s:bdzps02ARlShtevVcSWsTLptzhPdAF-y.r2nlOcl38jriMxfIhcvIzyFwS0V9nITPUz8orkAHMic",
      "language=cz",
    ],
  },
  parameters: {
    //Define initial request by $metadata?sap-client=902&sap-documentation=&sap-language=EN
    "sap-client": "902",
    "sap-documentation": ["heading", "quickinfo"],
    "sap-language": "EN",
  },
  strict: false, // ignore non critical errors, e.g. orphaned annotations
});

service.init.then(() => {
  //Code
});
```

Do not forgot to decode encoded cookie header which is taken from request/response header
in browser development tools

```javascript
decodeURIComponent(
  "JSESSIONID=s%3Abdzps02ARlShtevVcSWsTLptzhPdAF-y.r2nlOcl38jriMxfIhcvIzyFwS0V9nITPUz8orkAHMic"
);
```

### Headers authentication

Handle authorization process outside of the odata-library and pass authorization headers
to odata-library service.

Set authorization headers via environment variable

```shell
export ODATA_HEADERS='{"Authorization":"Bearer S0VLU0UhIExFQ0tFUiEK"}'
```

Set authorization headers via constructor

```javascript
const service = new Service({
  url: "https://localhost/service/",
  auth: {
    type: "headers",
    headers: {
      Authorization: "Basic Vk9MRk46aXVnaGVlOU8=",
    },
  },
});

service.init.then(() => {
  //Code
});
```

## Access EntitySets

The service contains property entitySets which contains instances of EntitySet class. The class
implements work with entities. You can access instance directly from the service if the EntitySet
name does not collide with The properties in the service class. If EntitySet name collide with
some service property wanting is print during initilization.

```javascript
service.entitySets.C_AllocationCycleTP.get({
  Identifier: "ID",
});
```

Access EntitySet by shorthand

```javascript
service.C_AllocationCycleTP.get({
  Identifier: "ID",
});
```
