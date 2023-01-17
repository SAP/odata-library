export = EntityContainer;
/**
 * Envelopes an EntityContainer.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/031f2e18-935b-461b-95ce-62e11432047a
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_EntityContainer
 *
 * @class EntityContainer
 * @extends {AnnotationTarget}
 */
declare class EntityContainer extends AnnotationTarget {
    /**
     * Creates an instance of EntityContainer.
     * @param {Object} rawMetadata raw metadata object for entity container
     * @memberof EntityContainer
     */
    constructor(rawMetadata: any);
    /**
     * Gets an EntitySet defined in container
     *
     * @param {string} [name] entity set name
     * @returns {EntitySet} set with given name
     * @memberof EntityContainer
     */
    getEntitySet(name?: string): EntitySet;
    /**
     * Gets an FunctionImport defined in container
     *
     * @param {string} [name] function import name
     * @returns {EntitySet} set with given name
     * @memberof EntityContainer
     */
    getFunctionImport(name?: string): EntitySet;
    /**
     * Initializes entity container child collection properties. Decoupled from constructor,
     * because it needs to resolve schema references and entity container elements.
     *
     * @param {CsdlSchema} schema to resolve references
     * @memberof EntityContainer
     */
    initSchemaDependentProperties(schema: CsdlSchema): void;
    /**
     * Resolves model path within this enetity container.
     *
     * @param {strin} [path] model path
     * @returns {Object} resolved container element
     * @memberof EntityContainer
     */
    resolveModelPath(path?: strin): any;
}
import AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");
import EntitySet = require("./EntitySet");
//# sourceMappingURL=EntityContainer.d.ts.map