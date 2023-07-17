# Read entity from EntitySet

If you define entity key by key clause You receive entity specified by the key.
You can define key as parameter of the EntitySet.get method

```javascript
service.C_AllocationCycleTP.get({
  AllocationType: "ACDOC_CC",
  AllocationCycle: "0LATAF2_3",
  AllocationCycleStartDate: "datetime'2017-01-01T00%3A00%3A00'",
  DraftUUID: "guid'00000000-0000-0000-0000-000000000000'",
  IsActiveEntity: "true",
});
```

or you can defined key by EntitysSet.key method

```javascript
service.C_AllocationCycleTP.key({
  AllocationType: "ACDOC_CC",
  AllocationCycle: "0LATAF2_3",
  AllocationCycleStartDate: new Date("2017-01-01T00:00:00"),
  DraftUUID: "00000000-0000-0000-0000-000000000000",
  IsActiveEntity: "true",
}).get();
```

## Select clause

Use `select` clause to limits properties returned from the OData server.

```javascript
var service = new Service();

service.init
  .then(() => {
    return service.AllocationCycle.select(
      "AllocationCycle",
      "AllocationCycleStartDate"
    ).get();
  })
  .then((res) => {
    console.log(
      "Only AllocationCycle and AllocationCycleStartDate are in results ... ",
      body.d.results
    );
  });
```

The `select` method accepts array also.

```javascript
service.AllocationCycle.select([
  "AllocationCycle",
  "AllocationCycleStartDate",
]).get();
```

If you try pass top clause to not countable EntitySet You raise exception .

## Use $filter clause

Use the $filter clause to filter out non matching entities. The filter definition
is automatically encoded to URL.

```javascript
var service = new Service();

service.init.then(() => {
  return client.AllocationCycle.filter("AllocationType eq 'ACDOC_CC'")
    .get()
    .then((cycles) => {
      /* your processing */
    });
});
```

## Top clause

Use top clause to limit number of responded entities

```javascript
var service = new Service();

service.init
  .then(() => {
    return service.AllocationCycle.top(1).get();
  })
  .then((res) => {
    console.log("Just one entity returned ... ", body.d.results.length);
  });
```

You can set number as parameter of get method to use top also

```javascript
service.AllocationCycle.get(1);
```

If you try pass top clause to not countable EntitySet You raise exception .

## Order by clause

Use orderby clause to specify an expression for determining what values are used to order the collection of Entries. This query option is only supported when the resource path identifies a Collection of Entries.

```javascript
service.C_AllocationSegmentTP.orderby(
  "AllocationCycleStartDate",
  "AllocationCycleSegment desc"
)
  .get()
  .then((data) => {
    // ...
  });
```

## Expand clause

The '$expand' option allows you to identify related Entries with a single URI such that a graph of Entries could be retrieved with a single HTTP request.

Multiple navigation properties can be expanded at once. `expand` method accepts array or multiple arguments.

Also nested navigation properties can be expanded. Navigation properties has to be separated by `/`.

```javascript
	service.C_UI5NetworkGraphGroup
		.expand(["to_Node/to_Attribute", "to_Node/to_Line"])
		.get();
        .then(data => {
            // ...
        });
```

## Use queryParameter

OData define set of standard parameters which could be added to the url or you can
implement other parameters in your server.

```javascript
service.C_AllocationCycleTP.queryParameter("$format", "json")
  .queryParameter("$top", "10")
  .get();
```

_Hint_

You could pass some standard parameters like $top which is also implemented as
special clause by `queryParameter`, but particular methods like `service.C_AllocationCycleTP.top`
contains additional checks implemented on the library side.

## Read count of entities in EntitySet

Use count method to get number of entities in EntitySet.

```javascript
var service = new Service();

service.init
  .then(() => {
    return service.AllocationCycle.count();
  })
  .then((res) => {
    console.log(`EntitySet contains ${res} entities.`);
  });
```

You can set number as parameter of get method to use top also

```javascript
service.AllocationCycle.get(1);
```

## Read parametrized entity sets (sap)

Parametrized CDS views creates parametrized entity sets. These can be read as follows:

```javascript
service.C_DAYSPAYABLESOUTSTANDING.parameters({
  P_PyblsRollingAverageMonths: 2,
  P_PurRollingAverageMonths: 2,
  P_DisplayCurrency: "EUR",
  P_ExchangeRateType: "M",
}).get(10);
```

Parametrized entity types are different in analytical and in transactional services, this api works for both.

## Read navigation properties

You can read association referenced by a NavigationProperty from any EntitySet that has already initialized key

```javascript
service.C_AllocationCycleTP.key({
  AllocationType: "ACDOC_CC",
  AllocationCycle: "0LATAF2_3",
  AllocationCycleStartDate: "datetime'2017-01-01T00%3A00%3A00'",
  DraftUUID: "guid'00000000-0000-0000-0000-000000000000'",
  IsActiveEntity: "true",
}).to_Segment.get();
```

Based on the multiplicity defined in metadata document the result of the promise is either single entity or array

The Association acts almost the same like EntitySet so you can for example specify query parameters or a key for the resource

```javascript
service.C_AllocationCycleTP.key({
  AllocationType: "ACDOC_CC",
  AllocationCycle: "0L14011902",
  AllocationCycleStartDate: "/Date(1547424000000)/",
  DraftUUID: "42f2e9af-c507-1ed9-8bbb-f206cf2596a5",
  IsActiveEntity: false,
})
  .to_Segment.get({
    AllocationType: "ACDOC_CC",
    AllocationCycle: "0L14011902",
    AllocationCycleStartDate: "/Date(1547424000000)/",
    AllocationCycleSegment: "0001",
    DraftUUID: "42f2e9af-c507-1ed9-8bbb-f2fb9b4476a7",
    IsActiveEntity: false,
  })
  .then((segment) => {
    //...
  });
```

Unfortunately the Netweaver implementation of the oData protocol does not support nested navigation in one request so this is **not possible**:

```javascript
service.C_ParentEntity.key({
  //...
})
  .to_Children.key({
    //...
  })
  .to_GrandChildren.get()
  .then(() => {
    // throws error
  });
```

## Read stream

The Netweaver backens support requests to binary data (typically PDF or Excel documents).
OData library correctly process three MIME types.

- `application/pdf`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

The request definition for binary data is same like request to navigation property.
The navigation property which provide binary data has to be marked as _HasStream_
in metadata. Response is `Buffer`which contains received binary data.

### Read stream by navigation property

Common use of navigation property with relation 1:1 is producing
stream.

```javascript
    service.Items.key({
            ApplObjectType: "PARAGON",
            ApplObjectId: "31415926",
            ItemId: "1"
        }).GetDocument.value().get();
    })
    .then((dataBuffer) => {
        parsePdf(dataBuffer);
    });
```

### Read stream from by single entity

Read stream entity with entity definiton. The example

```javascript
service.C_AllocationCycleTP.filter("IsActiveEntity eq true")
  .top(1)
  .get()
  .then((result) => {
    return service.AllocExcelTemplateSet.key({
      cycle: [
        result[0].AllocationType,
        result[0].AllocationCycle,
        new Date(
          parseInt(
            result[0].AllocationCycleStartDate.match(/\/Date\((\d+)\)\//)[1],
            10
          )
        )
          .toISOString()
          .replace(/(-|T.*)/g, ""),
      ].join(","),
    })
      .value()
      .get();
  })
  .then((result) => {
    assert.ok(result instanceof Buffer);
  });
```

# Read Fetch API response instead of parsed data

Use `raw` method to use plain response from Fetch API instead
of parsed data from OData response.

```javascript
service.C_AllocationCycleTP.raw()
  .get({
    AllocationType: "ACDOC_CC",
    AllocationCycle: "0LATAF2_3",
    AllocationCycleStartDate: "datetime'2017-01-01T00%3A00%3A00'",
    DraftUUID: "guid'00000000-0000-0000-0000-000000000000'",
    IsActiveEntity: "true",
  })
  .then((res) => {
    console.log(res);
  });
```
