"use strict";

const _ = require("lodash");

const REGEX_PLAIN_GUID =
  /^([A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12})$/;

function getGuidValue(value) {
  let matchGuid;
  if (value.match(REGEX_PLAIN_GUID)) {
    matchGuid = value.match(REGEX_PLAIN_GUID);
  } else {
    throw new Error(`Invalid value for Edm.Guid conversion - "${value}"`);
  }

  return matchGuid[1];
}

// BigInt is available in node.js since 2018/12 (10.4.0), but as experimental, and
// not all current run environments has this or newer version
// so it will not work ok for Int64
function getIntegerValue(value, bounds) {
  var normalizedValue = parseInt(value, 10);
  if (isNaN(normalizedValue)) {
    throw new Error(`"${value}" is not an integer value.`);
  }

  if (bounds && (normalizedValue < bounds[0] || normalizedValue > bounds[1])) {
    throw new Error(`Value "${value}" is out of type range.`);
  }

  return normalizedValue;
}

function isNull(value) {
  return _.isNull(value) || _.isUndefined(value);
}

function formatDateTime(value) {
  // toISOString uses 3 decimal places for sec, but real precision is determined by precision attribute of corresponding property
  // conversions should take in account type facets (precision, scale, ...)
  return _.isDate(value) ? value.toISOString() : new Date(value).toISOString();
}

const defaultConversion = encodeURIComponent;
const defaultBodyConversion = String;

let instances = [];

/**
 * Envelops primitive EDM type / EDM Simple Type.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_BuiltInAbstractTypes
 *
 * @class EdmSimpleType
 */
class EdmSimpleType {
  /**
   * Gets available Edm simple Types.
   *
   * @readonly
   * @static
   * @memberof EdmSimpleType
   */
  static get instances() {
    return instances;
  }

  /**
   * Creates an instance of EdmSimpleType.
   * @param {String} [name] name of the type
   * @param {function} [formatValue] value conversion for javascript variable (uri)
   * @param {function} [formatBodyValue] value conversion for javascript variable (body)
   * @memberof EdmSimpleType
   */
  constructor(name, formatValue, formatBodyValue) {
    Object.defineProperty(this, "name", {
      get: () => name,
    });

    let formatFn = formatValue || defaultConversion;
    Object.defineProperty(this, "formatFn", {
      get: () => formatFn,
    });

    let formatBodyFn = formatBodyValue || defaultBodyConversion;
    Object.defineProperty(this, "formatBodyFn", {
      get: () => formatBodyFn,
    });
  }

  /**
   * Gets namespace quialified name.
   *
   * @readonly
   * @memberof EdmSimpleType
   */
  get namespaceQualifiedName() {
    return `Edm.${this.name}`;
  }

  /**
   * Formats value as ODataPrimitive.
   *
   * @param {*} [value] source value
   * @returns {*} ODataPrimitive value
   * @memberof EdmSimpleType
   */
  format(value) {
    return isNull(value) ? "null" : this.formatFn(value);
  }

  /**
   * Formats value as ODataPrimitive for use in body.
   *
   * @param {*} [value] source value
   * @returns {*} ODataPrimitive value
   * @memberof EdmSimpleType
   */
  formatBody(value) {
    return isNull(value) ? null : this.formatBodyFn(value);
  }
}

// Not supported types (dtto Stream and geometry/geography):
// Stream, Geography, GeographyPoint, GeographyLineString, GeographyPolygon, GeographyMultiPoint,
// GeographyMultiLineString, GeographyMultiPolygon, GeographyCollection, Geometry, GeometryPoint,
// GeometryLineString, GeometryPolygon, GeometryMultiPoint, GeometryMultiLineString, GeometryMultiPolygon, GeometryCollection
instances = [
  new EdmSimpleType("Binary"),
  new EdmSimpleType("Boolean", (value) => String(Boolean(value)), Boolean),
  new EdmSimpleType(
    "Byte",
    (value) => getIntegerValue(value, [0, 255]),
    (value) => getIntegerValue(value, [0, 255])
  ),
  new EdmSimpleType("Date"),
  new EdmSimpleType("DateTimeOffset", formatDateTime, formatDateTime),
  new EdmSimpleType("Decimal", _.toNumber, _.toNumber),
  new EdmSimpleType("Double"),
  new EdmSimpleType("Duration"),
  new EdmSimpleType("Guid", getGuidValue, getGuidValue),
  new EdmSimpleType("Int16", getIntegerValue, getIntegerValue),
  new EdmSimpleType("Int32", getIntegerValue, getIntegerValue),
  new EdmSimpleType("Int64", getIntegerValue, getIntegerValue),
  new EdmSimpleType("SByte", getIntegerValue, getIntegerValue),
  new EdmSimpleType("Single"),
  new EdmSimpleType(
    "String",
    (value) => `'${encodeURIComponent(value)}'`,
    String
  ),
  new EdmSimpleType("TimeOfDay"),
];

module.exports = EdmSimpleType;
