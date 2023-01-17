export = ExpressionBuilder;
/**
 * Class for construction annotation values.
 *
 * @class ExpressionBuilder
 */
declare class ExpressionBuilder {
    static get scalarExpressions(): string[];
    static buildAnnotation(annotationMetadata: any): Annotation;
    static buildCollection(collectionMetadata: any): Collection;
    static buildRecord(recordMetadata: any): Record;
    static buildPropertyValue(propertyValueMetadata: any): PropertyValue;
    static assignElementValue(element: any, elementId: any): void;
}
import Annotation = require("./Annotation");
import Collection = require("./Collection");
import Record = require("./Record");
import PropertyValue = require("./PropertyValue");
//# sourceMappingURL=ExpressionBuilder.d.ts.map