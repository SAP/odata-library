# Actions

Actions are similar like function imports, but actions are primarily
used for CRUD operations (which could have side effect) and function
imports are normally used to just get informations without side effects.

We have implemented bound Actions.
Actions raises POST method.

# Call bound Actions

The instance of Action is function bound to the entity set. To
make action call function named by action on entity set instance.

```javascript
let service = new Service("https://host/path/to/service/0001/");

service.init.then(() => {
	return service.InHouseRepair.key({
		InHouseRepair:"1000000045"
	}).ConfirmRepairObjects({
		parameter1: "value"
	});
})
.then(console.log)
.catch(console.log);
```

# Call unbound Actions

Unbound actions are implemented in limited scope. Unbound actions should be
invoked through Action Imports. Current implementation assumes that Action
Import Name is same as corresponding Unbound Action Name. This might not be
allways the case according to OData documentation, but it is true for use
cases we have now.

```javascript
service.init.then(() => {
	return service.RepairObject({
		parameter1: "value"
	});
})
.then(console.log)
.catch(console.log);
```
