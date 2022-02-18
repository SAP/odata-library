# Client initialization

## Initialize by URL

You can pass url with (or without) authorization in one string in the code.

```javascript
var service = new Service(
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
export ODATA_CA_CERT_PATH="/etc/ssl/certificates/root.crt"
```

```javascript
var service = new Service();

service.init.then(() => {
  //Code
});
```

## Initialize by object

You can pass url and othere settings by object passed to the Service constructor.
You can also combine definitions. The parameter definition has precedence before
definitons in the environment variables.

```shell
export NODE_EXTRA_CA_CERTS=/etc/ssl/certificates/root.crt

```

```javascript
var service = new Service({
  url: "https://localhost/service/",
  annotationsUrl: "https://localhost/serviceMetadata/annotations",
  auth: {
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
