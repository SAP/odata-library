# async/await

An example of a test using async/await

```javascript
    var service = new Service();
    describe("Draft handling", () => {
        it("Create and update a draft", async () => {
            let draftData = await service.C_PaymentRequest.post({});
            assert.ok(draftData.DraftUUID, "Create (POST) successful.");
            let mergeResponse = await service.C_PaymentRequest.merge({
                "PaymentRequest": draftData.PaymentRequest,
                "DraftUUID": draftData.DraftUUID,
                "IsActiveEntity": draftData.IsActiveEntity,
                "PaymentRequestType": "FI-BL"
            });
            assert.ok(mergeResponse, "Update (MERGE) successful.");
        });
    });
```

Compare with same example with promises

```javascript
    var service = new Service();
    describe("Draft handling", () => {
        it("Create and update a draft", () => {
            return service.C_PaymentRequest
                .post({}).then((draftData) => {
                    assert.ok(draftData.DraftUUID, "Create (POST) successful.");
                    return service.C_PaymentRequest.merge({
                        "PaymentRequest": draftData.PaymentRequest,
                        "DraftUUID": draftData.DraftUUID,
                        "IsActiveEntity": draftData.IsActiveEntity,
                        "PaymentRequestType": "FI-BL"
                    });
                }).then((mergeResponse) => {
                    assert.ok(mergeResponse,  "Update (MERGE) successful.");
                })
        });
    });
```
