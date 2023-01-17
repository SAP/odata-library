export = ExtenderBase;
/**
 * Helper for vendor specific extensions.
 *
 * https://wiki.scn.sap.com/wiki/display/EmTech/SAP+Annotations+for+OData+Version+2.0
 * https://github.com/SAP/odata-vocabularies
 *
 * @class ExtenderBase
 */
declare class ExtenderBase {
    static get ATTRIBUTES_SCHEMA(): (string | ((value: any) => any))[][];
    /**
     * Creates and applies sap extension for schema element. It contains defined attributes.
     *
     * @static
     * @param {Object} item schema element to be extended, should contain .raw.$ object
     * @param {[Array]} attributes array of arrays defining attributes by name (kebap case) in first element and optional format function in second element
     * @memberof ExtenderBase
     */
    static applyAttributeExtension(item: any, attributes: [any[]]): void;
    /**
     * Applies extension object to schema element.
     *
     * @static
     * @param {Object} item schema element to be extended
     * @param {Object} extension extension object
     * @memberof ExtenderBase
     */
    static applyExtension(item: any, extension: any): void;
    /**
     * Creates sap extension for accessing attribute values.
     *
     * @param {Object} [source] object with .raw.$ object
     * @param {[Array]} [attributes] array of arrays defining attributes by name (kebap case) in first element and optional format function in second element
     * @returns {Object} extension object
     */
    static createAttributeExtension(source?: any, attributes?: [any[]]): any;
    static defaultFalseBool(value: any): boolean;
    static defaultTrueBool(value: any): boolean;
}
//# sourceMappingURL=ExtenderBase.d.ts.map