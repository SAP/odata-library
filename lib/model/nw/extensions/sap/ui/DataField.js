"use strict";

function valueParser(dataField, entityType) {
  let propertyValue = dataField.record.value.Value;
  if (!propertyValue) {
    throw new Error(
      `${dataField.type} doesn't define 'Value' property in '${entityType.name}' entity type.`
    );
  }

  let property = entityType.getProperty(propertyValue.path);
  Object.defineProperty(dataField, "property", {
    get: () => property,
  });
}

const propertyParsers = {
  "UI.DataField": valueParser,
  "UI.DataFieldWithAction": valueParser,
  "UI.DataFieldWithIntentBasedNavigation": valueParser,
  "UI.DataFieldWithNavigationPath": valueParser,
  "UI.DataFieldWithUrl": valueParser,
};

/**
 * Implements DataField, any variant from the DataFieldAbstract descendants hierarchy:
 *
 * DataFieldAbstract (abstract)
 *  - DataFieldForAnnotation
 *  - DataFieldForActionAbstract (abstract)
 *     - DataFieldForAction
 *     - DataFieldForIntentBasedNavigation
 *  - DataField
 *     - DataFieldWithAction
 *     - DataFieldWithIntentBasedNavigation
 *     - DataFieldWithNavigationPath
 *     - DataFieldWithUrl
 *
 * See https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/UI.md#DataFieldAbstract
 *
 * @class DataField
 */
class DataField {
  /**
   * Creates an instance of DataField.
   * @param {annotations.Record} record datafield definition record
   * @param {EntityType} [entityType] parent entity type
   * @memberof DataField
   */
  constructor(record, entityType) {
    Object.defineProperty(this, "record", {
      get: () => record,
    });

    Object.defineProperty(this, "type", {
      get: () => record.type,
    });

    let parser = propertyParsers[record.type];
    if (parser) {
      parser(this, entityType);
    }
  }
}

module.exports = DataField;
