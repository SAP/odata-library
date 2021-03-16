"use strict";

const EdmxModel = require("./EdmxModel");

/**
 * Some api functions have (namespace, name) parameters, but allows to enter just namespace which is treated as name then.
 *
 * @param {String} [namespace] namespace or name, if name not set
 * @param {String} [name] name or undefined
 * @returns {Object} object with real name and namespace properties
 */
function fromMaybeNameOrNamespace(namespace, name) {
  let realName = name ? name : namespace;
  let realNamespace = name ? namespace : undefined;

  if (!realName) {
    throw new Error("Missing name parameter");
  }

  return {
    name: realName,
    namespace: realNamespace,
    fullName: [realNamespace, realName].filter(Boolean).join("."),
  };
}

/**
 * Implements helpers to get metadata informations
 *
 * <h3>Overview</h3>
 *
 * <h3>Properties</h3>
 *
 * <ul>
 *   <li>raw - metadata in JSON format passed as parameter to constructor
 *   <li>model - metadata model constructed from raw metadata
 * </ul>
 *
 * @class Metadata
 */
class Metadata {
  /**
   * Creates an instance of <code>lib/Metadata</code> class.
   * @param {Object[]} [rawMetadata] list of metadata content fetched from the service in JSON format from xml2js
   * @param {Object} [settings] settings for the metadata
   * @memberof Metadata
   */
  constructor(rawMetadata, settings) {
    let model = rawMetadata
      .map((r) => new EdmxModel(r, settings))
      .sort((a, b) => !!b.EntityContainer - !!a.EntityContainer)
      .reduce((acc, val) => acc.merge(val));

    model.applySchemaExtensions(settings);

    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    Object.defineProperty(this, "model", {
      get: () => model,
    });
  }

  listEntitySetNames(namespace) {
    return this.model
      .getSchema(namespace)
      .getEntityContainer()
      .entitySets.map((s) => s.name);
  }

  /**
   * Create list of FunctionImport names
   *
   * @param {String} [namespace] is used to specify service namespace which contains EntitySets
   *
   * @returns {[String]} returns list of FunctionImport names
   *
   * @memberof Metadata
   */
  listFunctionImportNames(namespace) {
    return this.model
      .getSchema(namespace)
      .getEntityContainer()
      .functionImports.map((fi) => fi.name);
  }

  /**
   * Create structure for EntitySet definition. All keys has to be defined
   * and has to be generated by by engine.
   *
   * @param {String} [namespace] namespace or name, if name not set
   * @param {String} [name] name or undefined
   *
   * @returns {Object} returns structure which define entity set posibilities
   *
   * @example
   *	{
   *		"Name": "C_AllocationCycleTP",
   *		"EntityType": "FCO_MANAGE_ALLOCATION_SRV.C_AllocationCycleTPType",
   *		"Creatable": true,
   *		"Updatable": true,
   *		"Deletable": true,
   *		"Pageable": true,
   *		"Addressable": true,
   *		"Countable": true,
   *		"Searchable": false
   *	}
   *
   * @memberof Metadata
   */
  getEntitySet(namespace, name) {
    // the api should have different order of parameters, I think it should be obsoleted once there is alternative (probably in CsdlSchema)
    let target = fromMaybeNameOrNamespace(namespace, name);
    return this.model
      .getSchema(target.namespace)
      .getEntityContainer()
      .getEntitySet(target.name)
      .getLegacyApiObject();
  }

  /**
   * Get definition of the FunctionImport based on the metadata
   *
   * @param {String} [namespace] namespace or name, if name not set
   * @param {String} [name] name or undefined
   *
   * @returns {Object} returns structure which define FunctionImport properties and posibilities
   * @example
   * //Structure created by the getFunctionImport
   *{
   * 	"Name": "CopyAllocationSegment",
   * 	"ReturnType" : "Edm.Boolean",
   * 	"HttpMethod": "POST",
   * 	"Parameter": [{
   * 				"Name": "DraftUUID",
   * 				"Type": "Edm.Guid",
   * 				"Mode": "In"
   * 		},
   * 		{
   * 				"Name": "AllocationSegment",
   * 				"Type": "Edm.String",
   * 				"Mode": "In"
   * 		},
   * 		{
   * 				"Name": "AllocationStartDate",
   * 				"Type": "Edm.DateTime",
   * 				"Mode": "In",
   * 				"Precision": "0"
   * 		},
   * 		{
   * 				"Name": "AllocationCycle",
   * 				"Type": "Edm.String",
   * 				"Mode": "In"
   * 		},
   * 		{
   * 				"Name": "AllocationType",
   * 				"Type": "Edm.String",
   * 				"Mode": "In"
   * 		}
   * 	]
   *}
   * @memberof Metadata
   */
  getFunctionImport(namespace, name) {
    // the api should have different order of parameters, I think it should be obsoleted once there is alternative (probably in CsdlSchema)
    let target = fromMaybeNameOrNamespace(namespace, name);
    return this.model
      .getSchema(target.namespace)
      .getEntityContainer()
      .getFunctionImport(target.name)
      .getLegacyApiObject();
  }

  /**
   * Collect information about EntityType from metadata
   *
   * @param {String} [namespace] namespace or name, if name not set
   * @param {String} [name] name or undefined
   *
   * @returns {Object} returns structure which define EntityType structure
   *
   * @memberof Metadata
   */
  getEntityType(namespace, name) {
    // the api should have different order of parameters, I think it should be obsoleted once there is alternative (probably in CsdlSchema)
    let target = fromMaybeNameOrNamespace(namespace, name);
    return this.model
      .getSchema(target.namespace)
      .getEntityType(target.name)
      .getLegacyApiObject();
  }
}

module.exports = Metadata;