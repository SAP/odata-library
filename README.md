# OData library

[![REUSE status](https://api.reuse.software/badge/github.com/SAP/odata-library)](https://api.reuse.software/info/github.com/SAP/odata-library)

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

## Documentations

- [Read](doc/GET_ENTITY_SET.md) entities from the OData service
- [Create, update and delete](doc/ACTIVE_OPERATIONS.md) entities
- [Support for Entity Data Model types](doc/EDM_TYPES.md) and conversion of the Javascript variables to the OData primitives
- [Connect to services](doc/INITIALIZE.md) and define connection configuration
- [Writing tests](doc/TESTS.md) and running test with the testing frameworks
- [How to use async/await](doc/EXAMPLES.md) to avoid promises
- Validate OData [model](doc/MODEL.md)

## Contact Us

```
Jakub Vaclavik <jakub.vaclavik@sap.com>
Michal Nezerka <michal.nezerka@sap.com>
Norbert Volf <norbert.volf@sap.com>
```

## License

Copyright (c) 2020-2021 SAP SE or an SAP affiliate company and odata-library contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/odata-library).
