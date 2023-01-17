export = EdmSimpleType;
/**
 * Envelops primitive EDM type / EDM Simple Type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_BuiltInAbstractTypes
 *
 * @class EdmSimpleType
 */
declare class EdmSimpleType {
    /**
     * Gets available Edm simple Types.
     *
     * @readonly
     * @static
     * @memberof EdmSimpleType
     */
    static readonly get instances(): any[];
    /**
     * Creates an instance of EdmSimpleType.
     * @param {String} [name] name of the type
     * @param {function} [formatValue] value conversion for javascript variable (uri)
     * @param {function} [formatBodyValue] value conversion for javascript variable (body)
     * @memberof EdmSimpleType
     */
    constructor(name?: string, formatValue?: Function, formatBodyValue?: Function);
    /**
     * Gets namespace quialified name.
     *
     * @readonly
     * @memberof EdmSimpleType
     */
    readonly get namespaceQualifiedName(): string;
    /**
     * Formats value as ODataPrimitive.
     *
     * @param {*} [value] source value
     * @returns {*} ODataPrimitive value
     * @memberof EdmSimpleType
     */
    format(value?: any): any;
    /**
     * Formats value as ODataPrimitive for use in body.
     *
     * @param {*} [value] source value
     * @returns {*} ODataPrimitive value
     * @memberof EdmSimpleType
     */
    formatBody(value?: any): any;
}
//# sourceMappingURL=EdmSimpleType.d.ts.map