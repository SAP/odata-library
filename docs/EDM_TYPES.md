# How to use OData primitives in the OData test client

The OData primitives is defined by odata protocol
[here](https://www.odata.org/documentation/odata-version-2-0/overview/#AbstractTypeSystem);

The OData library is trying to convert possible
values to the OData promitives automatically. The conversion
is based on the metadata from the service. If conversion is
not possible the OData library raises error.

The conversions are uses for key predicates (the part of the
url which define entity key) and for POST/PUT/MERGE body which
define new entity or updates existing entity.


## Key predicate

If you try to read the entity the library automatically
converts values passed to the service.entitySet.get method
to the valid URL.

Example

The request defined by the OData library

```javascript
service.C_AllocationCycleTP.get({
	"AllocationType":"ACDOC_CC", //Edm.String
	"AllocationCycle":"0LATAF2_3", //Edm.String
	"AllocationCycleStartDate": new Date(1483228800000), //Edm.Datetime
	"DraftUUID":"00000000-0000-0000-0000-000000000000", //Edm.Guid
	"IsActiveEntity":true //Edm.Boolean
})
```
is converted to to the HTTP request

```
GET /path/to/service/C_AllocationCycleTP(AllocationType='ACDOC_CC'& AllocationCycle'0LATAF2_3'&AllocationCycleStartDate=datetime'2017-01-01T00:00'&DraftUUID=guid'00000000-0000-0000-0000-000000000000'&IsActiveEntity=true)

```
# Edm.Null

The null and undefined values are converted to the `null`.

Example

```javascript
service.C_AllocationCycleTP.get({
	"AllocationCycleName": undefined //AllocationCycleName=null
	"AllocationCycleName": null //AllocationCycleName=null
})
```

# Edm.Boolean

The OData library is converting any javascript value
to the Boolean object and then the Boolean object is converted
to the Edm.Boolean value.

The values  0, -0, null, false, NaN, undefined, or the empty string ("")
are converted to false and other values are converted to true

Example

```javascript
service.C_AllocationCycleTP.get({
	//IsActiveEntity=true
	"IsActiveEntity":true
	"IsActiveEntity":1
	"IsActiveEntity":"true"
	"IsActiveEntity":"false"

	//IsActiveEntity=false
	"IsActiveEntity":0
	"IsActiveEntity":false
	"IsActiveEntity":null
	"IsActiveEntity":""

})
```
# Edm.Datetime

The OData library is converting javascript Date object
tot the Edm.DateTime. The OData library is also trying dates
defined as ISO string or the string combines unix timestamp
and Date keyword `/Date(UNIX\_TIMESTAMP)/` (the format is used by Netweaver)

Example

```javascript
service.C_AllocationCycleTP.get({
	//Correct datetime  definition
	"AllocationCycleStartDate": new Date(1483228800000)
	"AllocationCycleStartDate": "/Date(1483228800000)/"
	"AllocationCycleStartDate": "datetime'2017-01-01T00:00'"

	//Incorrect datetime definitions
	"AllocationCycleStartDate": "1483228800000"
	"AllocationCycleStartDate": "Mon Dec 10 2018 09:37:30"
})
```
# Edm.String

The OData library is trying to convert any variable to the
Edm.String. The Edm.String values are
[encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).

Example

```javascript
service.C_AllocationCycleTP.get({
	"AllocationCycleName":true //AllocationCycle='true'
	"AllocationCycleName":1 //AllocationCycle='1'
	"AllocationCycleName":"TEST" //AllocationCycle='TEST'
	"AllocationCycleName":"#" //AllocationCycle='%23'
})
```
# Edm.Guid

The OData library acccepts only two formats of guid see example.
Other variable raises error.

Example

```javascript
service.C_AllocationCycleTP.get({
	//The only correct Guid valus
	"DraftUUID":"00000000-0000-0000-0000-000000000000" //guid'00000000-0000-0000-0000-000000000000'
	"DraftUUID":"guid'00000000-0000-0000-0000-000000000000'" //guid'00000000-0000-0000-0000-000000000000'
})
```
