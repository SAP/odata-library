"use strict";

const _ = require("lodash");
const TYPE = {
  COUNT: 1,
  LIST: 2,
  ENTITY: 3,
  LIST_STREAM: 4,
  ENTITY_STREAM: 5,
};

exports.COUNT = TYPE.COUNT;
exports.LIST = TYPE.LIST;
exports.ENTITY = TYPE.ENTITY;
exports.LIST_STREAM = TYPE.LIST_STREAM;
exports.ENTITY_STREAM = TYPE.ENTITY_STREAM;

exports.probes = {};

exports.probes[TYPE.COUNT] = function (request) {
  return _.get(request, "_isCount") === true;
};

exports.probes[TYPE.LIST] = function (request, resource) {
  return (
    Boolean(_.get(request, "_isList")) &&
    !_.get(resource, "entityTypeModel.hasStream")
  );
};

exports.probes[TYPE.ENTITY] = function (request, resource) {
  return (
    Boolean(_.get(request, "_isEntity")) &&
    !_.get(resource, "entityTypeModel.hasStream")
  );
};

exports.probes[TYPE.LIST_STREAM] = function (request, resource) {
  return (
    !_.get(request, "_isEntity") &&
    Boolean(_.get(resource, "entityTypeModel.hasStream"))
  );
};

exports.probes[TYPE.ENTITY_STREAM] = function (request, resource) {
  return (
    Boolean(_.get(request, "_isEntity")) &&
    Boolean(_.get(resource, "entityTypeModel.hasStream"))
  );
};

exports.determine = function (request, resource) {
  return _.find(TYPE, (value, key) =>
    exports.probes[TYPE[key]](request, resource)
  );
};
