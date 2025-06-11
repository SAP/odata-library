# Functions

In our library, functions are currently implemented as bound functions, which are
tied to a specific entity set. These functions are designed to be side-effect free,
meaning they do not modify any data. At this time, we only support bound functions,
and unbound functions are not yet available. The functions are an integral part of
the OData 4.0 service, providing additional functionality to users.

# Call bound Function

The instance of BoundableFunction is function bound to a resource.

If the resource has entity type collection, the function can be invoked
directly on the entity set.

```javascript
"use strict";

const Service = require("@sap_oss/odata-library").Service;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

let service = new Service({
  url: "https://hostname/path/toservice/",
  auth: {
    username: "USER",
    password: "*********",
  },
  strict: false,
});

service.init
  .then(() => service.EntitySet.FunctionName())
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
```
