# Create entity

Use EntitySet.post to create new entity. The entity is created from
object passed as parameter of the EntitySet.post method.

```javascript
let service = new Service();
return service.CorrespondenceOutputSet.post({
  Event: "SAP08",
  CorrespondenceTypeId: "SAP08",
  VariantId: "SAP08",
  CompanyCode: "M101",
  CustomerNumber: "BRQ002",
  AccountType: "D",
  Date1: "datetime'2038-01-19T03:14:07'",
  Email: {
    To: "nobody@sap.com",
    Subject: "SAP08 OM-OC arbitrary test",
    MailTemplateId: "FIN_OPI_LIST_EMAIL_TEMPLATE",
  },
}).then((res) => {
  console.log("Newly created entity ", res);
});
```

## Upload file to the backend

You can upload the file to the backend by using the EntitySet.post method. The entity set
endpoint is used as a file upload endpoint. The file is uploaded as a binary data. The
binary data is passed as a parameter of the EntitySet.post method. The binary data are
Buffer or FormData object. FormData object emulates the form data sent by the browser.

### Upload file as a Buffer

The simplest way (if it is supported by the backend) is to upload the file as a Buffer.

```javascript
let fileContent = Buffer.from("Hello World", "utf8");
service.XMLUpload.header("slug", "//NORBERT_TEST||PAYM")
  .post(fileContent)
  .then((response) => {
    response.text().then((text) => {
      assert.ok(response.status === 201);
      assert.ok(text.match(/imported/));
    });
  });
```

### Upload file as a FormData (browser emulation)

The backend supports in some cases FormData object. The FormData object is used to
emulate the form data sent by the browser. This is more complex example with reading
file from backend.

```javascript
const formData = new FormData();

fs.readFile("./test/resources/uploaBankFormatFile.xml")
  .then((content) => {
    const blob = new Blob([content], { type: "text/xml" });
    formData.append("file", blob, {
      name: "xmlFormatUpload",
      filename: "QMATE_CONSULTING.xml",
    });
    formData.append("_charset_", "UTF-8");
    formData.append("xmlFormatUpload-data", "");
  })
  .then(() =>
    service.XMLUpload.queryParameter("FILENAME", "XMLUPLOAD.XML")
      .queryParameter("BCONTEXT", "USER DEFAULTS")
      .header("slug", "//NORBERT_TEST||PAYM")
      .post(formData)
  )
  .then((response) => response.text())
  .then((text) => {
    assert.ok(response.status === 201);
    assert.ok(text.match(/imported/));
  });
```

## Navigation property

Use Association.post to create a new entry referenced by already initialized EntitySet

```javascript
var service = new Service();
service.C_AllocationCycleTP.key({
  AllocationType: "ACDOC_CC",
  AllocationCycle: "0L14011902",
  AllocationCycleStartDate: "/Date(1547424000000)/",
  DraftUUID: "42f2e9af-c507-1ed9-8bbb-f206cf2596a5",
  IsActiveEntity: false,
})
  .to_Segment.post({
    SegmentName: "003",
    SegmentNameDescription: "",
    AllocationType: "ACDOC_CC",
    AllocationCycle: "0L14011902",
    AllocationCycleStartDate: "/Date(1547424000000)/",
  })
  .then((segment) => {
    console.log("Newly created entity ", segment);
  });
```

# Update entity

OData protocol versions 1.0 and 2.0 define "MERGE" HTTP method to update
existing entity. Newer versions of OData protocol define "PATCH"
HTTP method to update existing entity. EntitySet supports both HTTP
methods. The EntitySet does not check current version of the OData
protocol version. You can try use _patch_ for OData 2.0 also. You
are limited by server implementation only. EntitySet.patch and
EntitySet.merge are synonyms.

Use merge or patch to update properties of an entity. The object
passed as parameter of the merge or patch method should contains
entries of the entity's key properties and entries of properties,
which are supposed to be updated.

```javascript
let service = new Service();
return service.C_PaymentRequest.patch({
  PaymentRequest: "861",
  DraftUUID: "0894ef30-1ccd-1ed8-bdde-86bb77adbb96",
  IsActiveEntity: false,
  Supplier: "100060",
}).then((res) => {
  console.log("Updated draft entity ", res);
});
```

merge and patch could be called with two parameter also. First parameter
contains key and second parameter contains object with properties
to change. It is useful for chaining.

```javascript
let service = new Service();
return service.init
  .then(() => {
    return service.C_PaymentRequest.get({
      PaymentRequest: "861",
      DraftUUID: "0894ef30-1ccd-1ed8-bdde-86bb77adbb96",
    });
  })
  .then((paymentRequest) => {
    return service.merge(paymentRequest, {
      Supplier: "100060",
    });
  })
  .then((res) => {
    console.log("Updated draft entity ", res);
  });
```

# Replace entity (entire resource)

Use EntitySet.put to replace an entity by replacing its content.
The entity content is replaced by a new content from object
passed as parameter of the EntitySet.put method.

```javascript
    let service  = new Service();
	return service .C_PaymentRequest
		.put({
			"PaymentRequest": "861",
			"DraftUUID": "0894ef30-1ccd-1ed8-bdde-86bb77adbb96",
			"IsActiveEntity": false,
			"PaymentRequestType": "FI-AP-PR",
			"Supplier": "100060",
			"PayeeName": "eileen vendor 10",
			"PayeeCityName": "Shanghai",
			"PayeeStreet": "111 test111",
			"PayeePostalCode": "201203",
			"PayeeCountry": "CN",
			"SupplierBankType": "01",
			...
		}).then((res) => {
		console.log("Updated draft entity ", res);
	});
```

The entity set can implement passing raw value
to the particular entity. You can set the value
to the entity by enabling value flag.

The functionality is used for uploading whole
files or whole JSON string to the backend.

```
    service.UploadedFiles.key({
        AllocationImportDataUUID: result.AllocationImportDataUUID
    })
        .value()
        .raw()
        .put(`RAW TEXT FOR BACKEND`).then(results => {
                assert.ok(_.isObject(results));
        });
```

# Delete entity

Use EntitySet.delete to delete an entity. The entity is deleted according
to the object, which contains key properties, passed as parameter of the
EntitySet.delete method.

```javascript
let service = new Service();
service.C_PaymentRequest.delete({
  PaymentRequest: "861",
  DraftUUID: "0894ef30-1ccd-1ed8-bdde-86bb77adbb96",
  IsActiveEntity: false,
}).then((res) => {
  console.log("Deleted draft entity ", res);
});
```

You can pass additional headers for the delete method also

```javascript
let service = new Service();
service.C_PaymentRequest.key({
  PaymentRequest: "861",
  DraftUUID: "0894ef30-1ccd-1ed8-bdde-86bb77adbb96",
  IsActiveEntity: false,
})
  .header("Accept-Language", "cs,de;q=0.9")
  .delete()
  .then((res) => {
    console.log("Deleted draft entity ", res);
  });
```
