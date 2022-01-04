"use strict";

const _ = require("lodash");

function getCollection(schema, path, settings) {
  let collection;
  if (settings.strict) {
    collection = schema.getEntityContainer().getEntitySet(path);
  } else {
    try {
      collection = schema.getEntityContainer().getEntitySet(path);
    } catch (error) {
      settings.logger.warn(
        `Can't find ValueListType collection for path '${path}'.`,
        error
      );
    }
  }

  return collection;
}

/**
 * Envelopes Value list type (F4 value help definition)
 *
 * https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/Common.md#ValueListType
 *
 * @class ValueListType
 */
class ValueListType {
  /**
   *Creates an instance of ValueListType.
   * @param {Annotation} [annotation] value list annotation
   * @param {CsdlSchema} [schema] for resolving references
   * @param {Object} [settings] parsing settings
   * @memberof ValueListType
   */
  constructor(annotation, schema, settings) {
    Object.defineProperty(this, "annotation", {
      get: () => annotation,
    });

    Object.defineProperty(this, "collectionPath", {
      get: () => _.get(annotation, "record.value.CollectionPath.string"),
    });

    let collection = this.collectionPath
      ? getCollection(schema, this.collectionPath, settings)
      : undefined;
    Object.defineProperty(this, "collection", {
      get: () => collection,
    });
  }
}

module.exports = ValueListType;
