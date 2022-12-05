"use strict";

const _ = require("lodash");
const TYPE = {
  COUNT: 1,
  LIST: 2,
  ENTITY: 3,
  ENTITY_VALUE: 6,
  PROPERTY_VALUE: 7,
};

exports.COUNT = TYPE.COUNT;
exports.LIST = TYPE.LIST;
exports.ENTITY = TYPE.ENTITY;
exports.ENTITY_VALUE = TYPE.ENTITY_VALUE;
exports.PROPERTY_VALUE = TYPE.PROPERTY_VALUE;

exports.probes = {};

exports.probes[TYPE.COUNT] = function (request) {
  return _.get(request, "_isCount") === true;
};

exports.probes[TYPE.LIST] = function (request) {
  return Boolean(_.get(request, "_isList"));
};

exports.probes[TYPE.ENTITY] = function (request) {
  return Boolean(_.get(request, "_isEntity")) && !_.get(request, "_isValue");
};

exports.probes[TYPE.ENTITY_VALUE] = function (request) {
  return (
    Boolean(_.get(request, "_isEntity")) &&
    Boolean(_.get(request, "_isValue")) &&
    !_.has(request, "_valuePropertyName")
  );
};

exports.probes[TYPE.PROPERTY_VALUE] = function (request) {
  return (
    Boolean(_.get(request, "_isEntity")) &&
    Boolean(_.get(request, "_isValue")) &&
    _.has(request, "_valuePropertyName")
  );
};

exports.determine = function (request, resource) {
  return _.chain(TYPE)
    .map((value) => value)
    .sortBy((type) => type)
    .find((type) => exports.probes[type](request, resource))
    .value();
};
