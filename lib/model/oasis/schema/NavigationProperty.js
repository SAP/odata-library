"use strict";

const _ = require("lodash");
const AnnotationTarget = require("../annotations/AnnotationTarget");
const CollectionType = require("./CollectionType");
const OnDeleteAction = require("./OnDeleteAction");
const ReferentialConstraint = require("./ReferentialConstraint");

/**
 * Envelops a navigation property.
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_NavigationProperty
 *
 *
 * @class NavigationProperty
 * @extends {AnnotationTarget}
 */
class NavigationProperty extends AnnotationTarget {
  /**
   * Creates an instance of NavigationProperty.
   * @param {Object} rawMetadata raw metadata object for NavigationProperty
   * @memberof NavigationProperty
   */
  constructor(rawMetadata) {
    super(rawMetadata);
    if (!this.name) {
      throw new Error("Name attribute is mandatory for NavigationProperty.");
    }

    if (_.has(this.raw.$, "Partner")) {
      // there is quite a lot of logic related to Partner attribute
      // see http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_PartnerNavigationProperty
      // since it is not used in library so far, only value is stored if specified, and no check are performed
      Object.defineProperty(this, "partner", {
        get: () => this.raw.$.Partner,
      });
    }

    // there is quite a lot of logic related to ContainsTarget attribute
    // see http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_ContainmentNavigationProperty
    // since it is not used in library so far, only value is stored, and no check are performed
    Object.defineProperty(this, "containsTarget", {
      get: () => this.raw.$.ContainsTarget === "true",
    });

    let constraints = (rawMetadata.ReferentialConstraint || []).map(
      (c) => new ReferentialConstraint(c)
    );
    Object.defineProperty(this, "referentialConstraints", {
      get: () => constraints,
    });

    this._processOnDelete(rawMetadata);
  }

  /**
   * Initializes schema dependent properties. Decoupled from constructor,
   * because it needs to resolve schema (type) references.
   *
   * @param {CsdlSchema} schema to resolve references
   * @memberof NavigationProperty
   */
  initSchemaDependentProperties(schema) {
    Object.defineProperty(this, "type", {
      get: () => schema.getType(this.raw.$.Type),
    });

    let isCollection = this.type instanceof CollectionType;
    Object.defineProperty(this, "isCollection", {
      get: () => isCollection,
    });

    if (isCollection) {
      if (_.has(this.raw.$, "Nullable")) {
        throw new Error(
          "Nullable MUST NOT be specified for a collection-valued navigation property."
        );
      }
    } else {
      Object.defineProperty(this, "nullable", {
        get: () => this.raw.$.Nullable !== "false",
      });
    }
  }

  /**
   * Gets navigation property target information.
   *
   * @param {CsdlSchema} schema to resolve model paths
   * @param {EntitySet|Singleton} source model of the source set/singleton
   * @returns {Object} navigation property target
   * @memberof NavigationProperty
   */
  getTarget(schema, source) {
    let navigationBinding = source.navigationPropertyBindings.filter(
      (b) => b.path === this.name
    )[0];
    // Target must resolve to an entity set, singleton, or direct or indirect containment navigation property of a singleton in scope.
    // The path can traverse single-valued containment navigation properties or single-valued complex properties before ending in a containment
    // navigation property, and there MUST NOT be any non-containment navigation properties prior to the final segment.
    // we are currently assuming that the target can be entity set only
    let entitySet = navigationBinding
      ? schema.getEntityContainer().resolveModelPath(navigationBinding.target)
      : undefined;

    return {
      entitySet: entitySet,
      entityType: this.type,
      isMultiple: this.isCollection,
    };
  }

  _processOnDelete(rawMetadata) {
    if (_.has(rawMetadata, "OnDelete")) {
      if (rawMetadata.OnDelete.length > 1) {
        throw new Error(
          "NavigationProperty may contain at most one child element OnDelete."
        );
      }

      let onDelete = new OnDeleteAction(rawMetadata.OnDelete[0]);
      Object.defineProperty(this, "onDelete", {
        get: () => onDelete,
      });
    }
  }
}

module.exports = NavigationProperty;
