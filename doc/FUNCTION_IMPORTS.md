# Function Import

# Simplified API in the service instance

To call FunctionImport is straightforward. The instance of service
has properties named by the function imports. The value of the property
is function which represents the FunctionImport.

```javascript
    let service = new Service();
	service.C_PaymentRequestActivation({
		"DraftUUID": "0894ef30-1ccd-1ed8-bbb3-a3d0c2bcb785"
		"IsActiveEntity": false
	}).then((ActivatedPaymentRequest) => {
		console.log(ActivatedPaymentRequest);
	});
```
## Enhanced API for Function Import

Service instance contains property `FunctionImports` which
contains instances of [FunctionImport](../lib/FunctionImport.js)
class.

## Use call method

It is same way like for Simplified API.


```javascript
    let service = new Service();
	service.functionImports.C_PaymentRequestActivation.call({
		"DraftUUID": "0894ef30-1ccd-1ed8-bbb3-a3d0c2bcb785"
		"IsActiveEntity": false
	}).then((ActivatedPaymentRequest) => {
		console.log(ActivatedPaymentRequest);
	});
```

## Define parameters in steps

You can pass parameters by `parameter` method instead of
passing whole object to the `call` method.


```javascript
    let service = new Service();
	let functionImport = service.functionImports.C_PaymentRequestActivation;

	functionImport.parameter("DraftUUID": "0894ef30-1ccd-1ed8-bbb3-a3d0c2bcb785'");
	functionImport.parameter("IsActiveEntity": false);

	functionImport.call().then((ActivatedPaymentRequest) => {
		console.log(ActivatedPaymentRequest);
	});
```

## Define parameters without client side conversions

Library automatically trying convert parameters to ODataPrimitive values, but You can
bypass the conversion by `queryParameter` method. The definition of the OData primitives
is [here](https://www.odata.org/documentation/odata-version-2-0/overview/#AbstractTypeSystem).


```javascript
    let service = new Service();
	let functionImport = service.functionImports.C_PaymentRequestActivation;
	functionImport
		.queryParameter("DraftUUID": "guid'0894ef30-1ccd-1ed8-bbb3-a3d0c2bcb785'")
		.queryParameter("IsActiveEntity": "false")
		.queryParameter("CycleName": `'encodeURIComponent(">>>> Pěnička a paraplíčko <<<<")'`)
		.call()
	.then((ActivatedPaymentRequest) => {
		console.log(ActivatedPaymentRequest);
	});
```
