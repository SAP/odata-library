# OData library

[![REUSE status](https://api.reuse.software/badge/github.com/SAP/odata-library)](https://api.reuse.software/info/github.com/SAP/odata-library)

A NodeJS library to access OData services provided by the Netweaver server.

## Documentation

Documentation is [here](https://sap.github.io/odata-library/).

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

## Contact Us

```
Jakub Vaclavik <jakub.vaclavik@sap.com>
Michal Nezerka <michal.nezerka@sap.com>
Norbert Volf <norbert.volf@sap.com>
```

## License

Copyright (c) 2020-2021 SAP SE or an SAP affiliate company and odata-library contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/SAP/odata-library).
