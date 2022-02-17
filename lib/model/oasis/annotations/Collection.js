"use strict";
const conditionalType = "If";

function getItemType(metadata) {
  let names = metadata
    ? Object.getOwnPropertyNames(metadata).filter((n) => n !== conditionalType)
    : [];
  if (names.length > 1) {
    throw new Error(
      `The values of the Collection child expressions MUST all be type compatible. Different child expressions were found: ${names}`
    );
  }

  return names[0];
}

function getScalarBuilder(name, expressionBuilder) {
  let isScalar = expressionBuilder.scalarExpressions.includes(name);
  return isScalar ? (x) => x : undefined;
}

function getStructureBuilder(name, expressionBuilder) {
  let builder = expressionBuilder["build" + name];
  if (!builder) {
    throw new Error(`Unknown type '${name}' found in collection.`);
  }

  return builder;
}

function getBuilder(name, expressionBuilder) {
  return (
    getScalarBuilder(name, expressionBuilder) ||
    getStructureBuilder(name, expressionBuilder)
  );
}

function getItems(metadata, expressionBuilder) {
  let itemType = getItemType(metadata);
  return itemType
    ? metadata[itemType].map(getBuilder(itemType, expressionBuilder))
    : [];
}

/**
 * Envelops an collection. (OASIS-CSDL)
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Collection
 * (https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/ecc942a0-af88-4012-be6f-439c706641d4)
 *
 * @class Collection
 * @extends {Array}
 */
class Collection extends Array {
  /**
   * Creates an instance of Collection.
   * @param {Object} rawMetadata raw metadata object for the collection
   * @param {Object} expressionBuilder expression builder for creating value objects
   * @memberof Collection
   */
  constructor(rawMetadata, expressionBuilder) {
    let items = getItems(rawMetadata, expressionBuilder);
    super(...items);

    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    // Expose at least metadata information for conditional items. With current xml parser, it is not possible to correctly
    // parse these expressions since the semantics depends on child elements order which is not provided by current xml parser.
    // http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_IfThenElse
    Object.defineProperty(this, "conditionalItems", {
      get: () => rawMetadata[conditionalType],
    });
  }
}

module.exports = Collection;
