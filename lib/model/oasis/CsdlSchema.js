"use strict";

const _ = require("lodash");
const Action = require("./schema/Action");
const ComplexType = require("./schema/ComplexType");
const CollectionType = require("./schema/CollectionType");
const EdmSimpleType = require("./schema/EdmSimpleType");
const EntityType = require("./schema/EntityType");
const FunctionType = require("./schema/Function");
const EntityContainer = require("./dataSource/EntityContainer");
const EnumType = require("./schema/EnumType");
const TypeDefinition = require("./schema/TypeDefinition");
const Extender = require("./extensions/Extender");

// Schema can contain elements edm:Annotation and edm:Term. They are used to define annotation vocabulary.
// These elements are used in schemas in services edmx:References. We currently do not validate service schema
// against them so edm:Annotation and edm:Term will not be implemented in schema for time being.
const childCollections = [
  {
    name: "enumTypes",
    sourceElement: "EnumType",
    Class: EnumType,
  },
  {
    name: "typeDefinitions",
    sourceElement: "TypeDefinition",
    Class: TypeDefinition,
  },
  {
    name: "complexTypes",
    sourceElement: "ComplexType",
    Class: ComplexType,
  },
  {
    name: "entityTypes",
    sourceElement: "EntityType",
    Class: EntityType,
  },
  {
    name: "actions",
    sourceElement: "Action",
    Class: Action,
  },
  {
    name: "functions",
    sourceElement: "Function",
    Class: FunctionType,
  },
  {
    name: "entityContainers",
    sourceElement: "EntityContainer",
    Class: EntityContainer,
  },
];

/**
 * Top-level conceptual schema definition language (CSDL) construct that allows creation of a namespace.
 * OASIS
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html
 *
 * @class CsdlSchema
 */
class CsdlSchema {
  /**
   * Creates an instance of CsdlSchema.
   * @param {Object} rawMetadata raw metadata object for schema
   * @param {Object} [settings] (normalized) settings for the metadata, e.g. { strict: false } to ignore non critical errors
   * @param {EdmxModel} metaModel root point of metadata in-memory structure
   *
   * @memberof CsdlSchema
   */
  constructor(rawMetadata, settings, metaModel) {
    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    Object.defineProperty(this, "namespace", {
      get: () => rawMetadata.$.Namespace,
    });

    Object.defineProperty(this, "alias", {
      get: () => rawMetadata.$.Alias,
    });

    let extensions = [];
    Object.defineProperty(this, "extensions", {
      get: () => extensions,
    });

    Object.defineProperty(this, "settings", {
      get: () => settings,
    });

    CsdlSchema.initChildProperties(this, metaModel);
    CsdlSchema.initSchemaDependentProperties(this);
    this.applyAnnotations(rawMetadata.Annotations);
  }

  /**
   * Gets an EntityType defined in schema
   *
   * @param {string} [name] type name
   * @returns {EntityType} type with given name
   * @memberof CsdlSchema
   */
  getEntityType(name) {
    let type = this.entityTypes.find((t) => t.name === name);
    if (!type) {
      throw new Error(
        `EntityType '${name}' not found in namespace '${this.namespace}'`
      );
    }

    return type;
  }

  /**
   * Gets entity container with given name (or default container).
   *
   * @param {string} [name] (optional) name of the container.
   * @returns {Object} entity container
   */
  getEntityContainer(name) {
    return this.entityContainers.find((c) => (name ? c.name === name : true));
  }

  /**
   * Gets a Type available in schema
   *
   * Enumeration types, collection types and Untyped are not implemented.
   *
   * @param {string} [name] namespace qualified type name
   * @returns {EntityType|ComplexType|SimpleType} type with given name
   * @memberof CsdlSchema
   */
  getType(name) {
    let target = CsdlSchema.parseTypePath(name);
    let type = this._getTypeCollections(target.namespace)
      .map((types) => types.find((t) => t.name === target.name))
      .find((t) => !!t);

    if (!type) {
      throw new Error(`Unknown type '${name}'.`);
    }

    return target.isCollection ? new CollectionType(type) : type;
  }

  /**
   * Resolves model path expression.
   *
   * A model path is used within Annotation Path, Model Element Path, Navigation Property Path,
   * and Property Path expressions to traverse the model of a service and resolves to the model
   * element identified by the path
   *
   * Implemented only needed scope.
   *
   * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Target
   * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_PathExpressions
   *
   * @param {string} path model path expression
   * @returns {Object} schema element
   * @memberof CsdlSchema
   */
  resolveModelPath(path) {
    let target = this._parseModelPath(path);
    let child = childCollections
      .map((collection) =>
        this[collection.name].find((item) => item.name === target.element)
      )
      .filter(Boolean);

    if (child.length === 0) {
      throw new Error(`Can't find schema element for path "${path}".`);
    } else if (child.length > 1) {
      throw new Error(
        `Schema error: "${path}" matched ${child.length} schema elememts.`
      );
    }

    let element = child[0].resolveModelPath(target.subElement, this);
    if (!element) {
      throw new Error(
        `Can't resolve '${path}' model path. '${target.element}' found, but '${target.subElement}' did not resolve.`
      );
    }

    return element;
  }

  /**
   * Applies annotations to target elements structures.
   *
   * @param {Object[]} annotationsData raw annotaions data
   * @memberof CsdlSchema
   */
  applyAnnotations(annotationsData) {
    if (annotationsData && this.raw.EntityContainer) {
      let validItems = annotationsData.filter((annotation) =>
        _.get(annotation, "$.Target")
      );
      let annotationGroups = _.groupBy(
        validItems,
        (annotation) => annotation.$.Target
      );
      _.each(annotationGroups, this._applyAnnotationsToPath.bind(this));
    }
  }

  /**
   * Applies annotation based vendor extensions.
   *
   * @param {Object} [settings] parsing settings
   * @memberof CsdlSchema
   */
  applyExtensions(settings) {
    Extender.apply(this, settings);
  }

  /**
   * Creates path structure from model path.
   *
   * @param {string} [path] annotation target model path
   * @returns {Object} structure describing annotation target
   * @memberof CsdlSchema
   * @private
   */
  _parseModelPath(path) {
    let target = CsdlSchema.parseModelPath(path);

    if (
      target.namespace !== this.namespace &&
      target.namespace !== this.alias
    ) {
      throw new Error(
        `Annotation namespace/alias mismatch. (schema: '${this.namespace}'/'${this.alias}' vs annotation: '${target.namespace}'`
      );
    }

    return target;
  }

  /**
   * Gets type collections for a namespace.
   *
   * @param {string} [namespace] type namespace
   * @returns {Object[]} array of type collections
   * @memberof CsdlSchema
   * @private
   */
  _getTypeCollections(namespace) {
    let typeCollections = [];
    if (namespace === this.namespace) {
      typeCollections = [
        this.entityTypes,
        this.complexTypes,
        this.enumTypes,
        this.typeDefinitions,
      ];
    } else if (namespace === "Edm") {
      typeCollections = [EdmSimpleType.instances];
    }

    return typeCollections;
  }

  /**
   * Applies annotations to specific path. Error handling is done according to schema settings.
   *
   * @param {Object[]} [annotations] annotations to apply
   * @param {string} [path] target path
   * @memberof CsdlSchema
   * @private
   */
  _applyAnnotationsToPath(annotations, path) {
    let target;
    if (this.settings.strict) {
      target = this.resolveModelPath(path);
    } else {
      try {
        target = this.resolveModelPath(path);
      } catch (error) {
        this.settings.logger.warn(
          `Can't find annotation target for path '${path}'.`,
          error
        );
      }
    }

    if (target) {
      try {
        target.applyAnnotations(annotations);
      } catch (e) {
        throw new Error(
          `Error occured while applying annotations for '${path}': ${e.message}\n${e.stack}`
        );
      }
    }
  }

  /**
   * Initialize metadata collections (EntityType, Action,...)
   *
   * @param {CsdlSchema} schema - instance of the schema to append collections
   * @param {EdmxModel} metaModel - instance of metadata model class. The instance
   *        is passed to child instances for cross reference usage like basetype
   *        and entity types from differnet schemas
   */
  static initChildProperties(schema, metaModel) {
    childCollections.forEach((collection) => {
      let child = _.get(schema.raw, collection.sourceElement, []).map(
        (typeRawMetadata) => {
          return new collection.Class(typeRawMetadata, metaModel);
        }
      );
      Object.defineProperty(schema, collection.name, {
        get: () => child,
      });
    });
  }

  static initSchemaDependentProperties(schema) {
    childCollections.forEach((collection) => {
      let items = schema[collection.name];
      if (items.length > 0 && items[0].initSchemaDependentProperties) {
        items.forEach((item) => item.initSchemaDependentProperties(schema));
      }
    });
  }

  static matchPath(regex, path, name) {
    let matches = regex.exec(path);

    if (!matches) {
      throw new Error(`Unknown ${name} format: ${path}`);
    }

    return matches;
  }

  static parseTypePath(targetPath) {
    let collectionMatches = /Collection\((.+)\)/.exec(targetPath);
    let matches = CsdlSchema.matchPath(
      /([a-z0-9_\.]+)\.([a-z0-9_]+)$/i,
      collectionMatches ? collectionMatches[1] : targetPath,
      "type path"
    );

    return {
      path: matches[0],
      namespace: matches[1],
      name: matches[2],
      isCollection: !!collectionMatches,
    };
  }

  static parseModelPath(targetPath) {
    let matches = CsdlSchema.matchPath(
      /^([a-z0-9_\.]+)\.([a-z0-9_]+)(\/|\/([a-z0-9_]+))?$/i,
      targetPath,
      "model path"
    );

    return {
      path: matches[0],
      namespace: matches[1],
      element: matches[2],
      subElement: matches[4],
    };
  }
}

module.exports = CsdlSchema;
