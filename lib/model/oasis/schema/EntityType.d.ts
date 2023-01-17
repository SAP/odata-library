export = EntityType;
/**
 * Envelops an entity type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntityType
 *
 * @class EntityType
 * @extends {ComplexType}
 */
declare class EntityType extends ComplexType {
    /**
     * Creates an instance of EntityType.
     *
     * @param {Object} rawMetadata raw metadata object for complex type
     * @param {EdmxModel} metaModel root point of metadata in-memory structure
     *
     * @memberof EntityType
     */
    constructor(rawMetadata: any, metaModel: EdmxModel);
    /**
     * Creates entity type 'key' property.
     *
     * @returns {Property[]} array of properties that defines entity key
     * @param {EdmxModel} metaModel root point of metadata in-memory structure
     *
     * @memberof EntityType
     *
     * @private
     */
    private _createKey;
    /**
     * Check if key parameters are correct to build key
     *
     * @param {String} baseType name of OData service base type
     * @param {Object[]} keyDefinition raw key definition
     *
     * @returns {Boolean} returns true for valid parameters
     *
     * @memberof EntityType
     *
     * @private
     */
    private isValidKeyDefinition;
}
import ComplexType = require("./ComplexType");
//# sourceMappingURL=EntityType.d.ts.map