# Use Batch Request

The batch request sends multiple OData requests in one HTTP request.

Specification is [here](http://docs.oasis-open.org/odata/odata/v4.01/cs01/part1-protocol/odata-v4.01-cs01-part1-protocol.html#sec_BatchRequests).

## Read data by one batch

The batch is identified by batchId, but if you use just one
batch it is used as default batch.

```javascript
service.createBatch();
service.C_AllocationCycleTP.get(1).then((particularResponse) => {
	console.log("Response 1:", particularResponse);
});
service.C_AllocationCycleTP.key({
	"AllocationType":"ACDOC_CC",
	"AllocationCycle":"0LATAF2_3",
	"AllocationCycleStartDate": new Date("2017-01-01T00:00:00"),
	"DraftUUID":"00000000-0000-0000-0000-000000000000",
	"IsActiveEntity":"true"
}).get().then((particularResponse) => {
	console.log("Response 2:", particularResponse);
});
service.sendBatch().then((responses) => {
	console.log("Response 1 & Response 2:", particularResponse);
});
```

## Use changeset to call POST

It looks like netweawer permits active POST in the batch only
if the POST is part of changeset. The example creates new purchase
order items.


```javascript

const PURCHASE_ORDER_ITEMS = [
    {
        CompanyCode: "1010",
        PurchaseOrderType: "NB",
        Supplier: "10300001",
        PurchasingOrganization: "1010",
        PurchasingGroup: "001",
        DocumentCurrency: "JPY",
        to_PurchaseOrderItem: [
            {
                PurchaseOrderItem: "0010",
                Plant: "1010",
                OrderQuantity: "7",
                NetPriceAmount: "130.00",
                NetPriceQuantity: "1",
                PurchaseOrderItemCategory: "0",
                Material: "TG11"
            }
        ]
    }
];

async function main() {
    let results;
    await service.init;
    service.createBatch();
    _.each(PURCHASE_ORDER_ITEMS, (item) => {
        service.createChangeSet();
        service.A_PurchaseOrder.post(item);
        service.commitChangeSet();
    });
    results = await service.sendBatch();
    console.log("Purchase Orders", results);
}

main();
```
