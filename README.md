# OData library

A NodeJS library to access OData services provided by the Netweaver server.

## Installation


```shell
$ npm  install odata-library
```

## Getting Started

```javascript
var service = new Service("https://username:password@localhost/path/to/service/");

service.init.then(()=> {
    return service.Entity_Set_Name.get(1);
}).then((result) => {
    console.log(result);
});
```

## Documentations

* [Read](doc/GET_ENTITY_SET.md) entities from the OData service
* [Create, update and delete](doc/ACTIVE_OPERATIONS.md) entities
* [Support for Entity Data Model types](doc/EDM_TYPES.md) and conversion of the Javascript variables to the OData primitives
* [Connect to services](doc/INITIALIZE.md) and define connection configuration
* [Writing tests](doc/TESTS.md) and running test with the testing frameworks
* [How to use async/await](doc/EXAMPLES.md) to avoid promises
* Validate OData [model](doc/MODEL.md)

## Chat

If you have any question join us on [the slack channel](https://sap-s4hana-cloudux.slack.com/messages/CFDSF4WB1).

## Contact Us

```
Jakub Vaclavik <jakub.vaclavik@sap.com>
Norbert Volf <norbert.volf@sap.com>
```

## License

Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted
otherwise in [the LICENSE file](LICENSE)
