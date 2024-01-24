export = ActionImport;
/**
 * Javascript class which implements Action Import funcionality
 *
 * @class ActionImport
 */
declare class ActionImport {
    /**
     * Creates ActionImport instance from schema and Action
     *
     * @static
     * @param {CsdlSchema} schema service schema
     * @param {Action} action action of the action import
     * @return {ActionImport} action import instance, if it can be found
     * @memberof ActionImport
     */
    static fromSchemaAndAction(schema: CsdlSchema, action: Action): ActionImport;
    /**
     * Creates an instance of <code>ActionImport</code>.
     * @param {Action} action instance of the Action class
     * @param {Object} metadata information about ActionImport from Metadata
     * @memberof ActionImport
     */
    constructor(action: Action, metadata: any);
    /**
     * Create function which directly call's action import without
     * additional selection of the \"call\" method.
     *
     * @return {Function} function which directly send request to the
     *                    Action
     *
     * @memberof ActionImport
     */
    createDirectCaller(): Function;
}
//# sourceMappingURL=ActionImport.d.ts.map