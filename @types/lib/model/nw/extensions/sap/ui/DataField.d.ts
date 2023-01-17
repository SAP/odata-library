export = DataField;
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
declare class DataField {
    /**
     * Creates an instance of DataField.
     * @param {annotations.Record} record datafield definition record
     * @param {EntityType} [entityType] parent entity type
     * @memberof DataField
     */
    constructor(record: annotations.Record, entityType?: EntityType);
}
//# sourceMappingURL=DataField.d.ts.map