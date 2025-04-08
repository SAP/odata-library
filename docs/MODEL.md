# OData model

```Service``` class exposes simple api for entity sets and function imports. To explore and validate whole OData model, more powerful api can be used. Whole model is available under ```service.metadata.model```.

Model can contain multiple schemas, but it is very likely that service will contain just one default schema. It can be accessed like this ```service.defaultSchema.getEntityContainer()```.

## Model traversing

Model implementation does some handy stuff, like resolving references to model elements so that you don't need to look it up by name.

```javascript
let keyPropertyLabels = service.defaultSchema.getEntityContainer()
    .getEntitySet('MySet')
    .entityType
    .key
    .map(p => p.sap.label)
```

## Validate annotated model

It is possible to validate service model for various requirements. That is useful especially for Fiori Elements applications services.

Following code finds all entity types that has UI visible column without label.

```javascript
let missingLabelsEntityTypes = service.defaultSchema
    .entityTypes
    .filter(t => t.properties
        .some(p => !p.sap.label && !p.hasTerm('UI.Hidden')))
});
```

## Model specification

Model implements OData CSDL protocol (combination of [MS](https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/f7d95765-3b64-4c77-b144-9d28862b0403) and [OASIS](http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html) specifications). Also SAP extensions for [annotations](https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0) and [vocabularies](https://github.com/SAP/odata-vocabularies) are partially implemented.
