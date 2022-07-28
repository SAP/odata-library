"use strict";

const AnnotationTarget = require("../../oasis/annotations/AnnotationTarget");

/**
 * Envelops a navigation property.
 *
 * There are big differences OASIS-CSDL and MC-CSDL navigation properties. SAP follows MC-CSDL in this.
 *
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/e83d21c4-7f0a-4cc7-ac38-f2fbe15d3398
 * (http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_NavigationProperty)
 *
 * @class NavigationProperty
 * @extends {AnnotationTarget}
 */
class NavigationProperty extends AnnotationTarget {
  /**
   * Creates an instance of NavigationProperty.
   * @param {Object} rawMetadata raw metadata object for navigation property
   * @memberof NavigationProperty
   */
  constructor(...args) {
    const rawMetadata = args[0];
    super(...args);

    Object.defineProperty(this, "relationship", {
      get: () => rawMetadata.$.Relationship,
    });

    Object.defineProperty(this, "fromRole", {
      get: () => rawMetadata.$.FromRole,
    });

    Object.defineProperty(this, "toRole", {
      get: () => rawMetadata.$.ToRole,
    });

    Object.defineProperty(this, "association", {
      get: () => {
        const association = this.model.resolveModelPath(this.relationship);
        if (!association) {
          throw new Error(
            `Association for navigation property ${this.name} does not exists.`
          );
        }
        return association;
      },
    });

    Object.defineProperty(this, "associationEnd", {
      get: () => {
        const associationEnd = this.association.findEnd(this.toRole);

        if (!associationEnd) {
          throw new Error(
            `Association endpoint for navigation property ${this.name} does not exists.`
          );
        }

        return associationEnd;
      },
    });

    Object.defineProperty(this, "type", {
      get: () => {
        return {
          elementType: this.associationEnd.type,
        };
      },
    });

    Object.defineProperty(this, "isCollection", {
      get: () => {
        return this.associationEnd.multiplicity === "*";
      },
    });
  }

  /**
   * Gets navigation property target information.
   *
   * @param {CsdlSchema} schema to resolve model paths
   * @returns {Object} navigation property target
   * @memberof NavigationProperty
   */
  getTarget(schema) {
    let associationSet = schema
      .getEntityContainer()
      .associationSets.find(
        (a) => `${schema.namespace}.${a.association.name}` === this.relationship
      );

    if (!associationSet) {
      throw new Error(
        `AssociationSet for association '${this.relationship}' not found.`
      );
    }

    let end = associationSet.ends.find((e) => e.role === this.toRole);
    if (!end) {
      throw new Error(
        `AssociationSet End with ${this.toRole} role not present in '${this.relationship}' association set.`
      );
    }

    return {
      associationSetEnd: end,
      entitySet: end.entitySet,
      entityType: end.entitySet.entityType,
      isMultiple: end.associationEnd.multiplicity === "*",
    };
  }

  /**
   * Gets legacy api object. (XML casing, maybe some other changes.)
   *
   * @returns {Object} legacy api object
   * @memberof NavigationProperty
   */
  getLegacyApiObject() {
    return Object.assign(super.getLegacyApiObject(), {
      getTarget: (schema) => this.getTarget(schema),
      Relationship: this.relationship,
      FromRole: this.fromRole,
      ToRole: this.toRole,
    });
  }
}

module.exports = NavigationProperty;
