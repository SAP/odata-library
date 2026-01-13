export = Action;
/**
 * Action - service-defined operation.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Action
 *
 * @class Action
 * @extends {BoundObject}
 */
declare class Action extends BoundObject {
    static SCHEMA_GROUP: string;
    /**
     * Checks whether the action matches the given model path.
     *
     * @param {Object} parsedPath parsed model path
     *
     * @returns {Boolean} true if the action matches the model path
     * @memberof Action
     */
    matchModelPath(parsedPath: any): boolean;
    /**
     * Checks whether the action is bound by the given type name.
     *
     * @param {String} boundTypeName bound type name to check
     *
     * @returns {Boolean} true if the action is bound by the given type
     * @memberof Action
     */
    isBoundByType(boundTypeName: string): boolean;
}
import BoundObject = require("./BoundObject");
//# sourceMappingURL=Action.d.ts.map