A NodeJS library to access OData services provided by the Netweaver server.

## Prerequisites

NodeJS is installed. Minimum version of NodeJS is 18.

## Installation

```shell
$ npm  install @sap_oss/odata-library
```

## Getting Started

```javascript
const Service = require("@sap_oss/odata-library").Service;

let service = new Service(
  "https://username:password@localhost/path/to/service/"
);

service.init
  .then(() => {
    return service.Entity_Set_Name.get(1);
  })
  .then((result) => {
    console.log(result);
  });
```

## Upgrade to version 1.x from 0.x

"ca" parameter is not supported (due to use fetch instead of
superagent). Use environment variable `NODE_EXTRA_CA_CERTS`
to define custom certificate authority.

```
export NODE_EXTRA_CA_CERTS=[your CA certificate file path]
```
