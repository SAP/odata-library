export = Association;
/**
 * Envelops an association.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/77d7ccbb-bda8-444a-a160-f4581172322f
 * (not present in OASIS-CSDL)
 *
 * @class Association
 */
declare class Association {
    /**
     * Creates an instance of Association.
     * @param {Object} rawMetadata raw metadata object for the association
     * @memberof Association
     */
    constructor(rawMetadata: any);
    /**
     * Initializes schema dependent properties. Decoupled from constructor,
     * because it needs to resolve schema (type) references.
     *
     * @param {CsdlSchema} schema to resolve references
     * @memberof EntityContainer
     */
    initSchemaDependentProperties(schema: CsdlSchema): void;
    /**
     * Resolves model path within this association.
     *
     * @param {string} [path] model path
     * @returns {Object} resolved element
     * @memberof ComplexType
     */
    resolveModelPath(path?: string): any;
    /**
     * Find endpoint of the association
     *
     * @param {String} role identifer of the role which need to be find
     *
     * @returns {AssociationEnd} found endpoint of the association
     *
     * @memberof Association
     */
    findEnd(role: string): AssociationEnd;
}
import AssociationEnd = require("./AssociationEnd");
//# sourceMappingURL=Association.d.ts.map