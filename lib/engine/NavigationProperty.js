"use strict";

const QueryableResource = require("./QueryableResource");

/**
 * Envelope GET/POST methods for particular Navigation Property.
 *
 * @class NavigationProperty
 * @extends {QueryableResource}
 */
class NavigationProperty extends QueryableResource {
  /**
   * Creates an instance of <code>NavigationProperty</code>.
   *
   * @param {EntitySet} source instance of the EntitySet class @see EntitySet.js
   * @param {Object} navigationProperty information about NavigationProperty
   * @param {Metadata} metadata instance of the metadata object that keeps service metadata
   *
   * @public
   * @memberof NavigationProperty
   */
  constructor(source, navigationProperty, metadata) {
    let target = navigationProperty.getTarget(
      metadata.model.getSchema(),
      source.entitySetModel
    );
    let targetElementType =
      navigationProperty.isCollection && target.entityType.elementType
        ? target.entityType.elementType
        : target.entityType;
    super(source.agent, source.metadata, target.entitySet, targetElementType);
    Object.defineProperty(this, "navigationProperty", {
      value: navigationProperty,
      writable: false,
    });

    Object.defineProperty(this, "source", {
      value: source,
      writable: false,
    });

    Object.defineProperty(this, "target", {
      value: target,
      writable: false,
    });
  }

  /**
   * Resets default request of the navigation property
   * and "parent" entity set also
   *
   * @memberof NavigationProperty
   *
   * @protected
   */
  reset() {
    QueryableResource.prototype.reset.call(this);
    this.source.reset();
  }

  /**
   * Indicates of the NavigationProperty Multiplicity is multiple or not
   * @returns {Boolean} true if the multiplicity is *
   * @memberof NavigationProperty
   */
  isMultiple() {
    return this.target.isMultiple;
  }

  /**
   * Gets path to the single resource
   * @returns {string} single resource path
   * @memberof NavigationProperty
   */
  getSingleResourcePath() {
    let keyProperties;
    let keyPredicate;

    if (this.isMultiple()) {
      keyProperties = this.keyProperties(this.defaultRequest._keyValue);
      keyPredicate = this.keyPredicate(keyProperties);

      return `${this.getListResourcePath()}(${keyPredicate})`;
    } else {
      return this.getListResourcePath();
    }
  }

  /**
   * Gets path to the list of resources
   * @returns {string} path to the list of resources
   * @memberof NavigationProperty
   */
  getListResourcePath() {
    return `${this.source.getSingleResourcePath()}/${
      this.navigationProperty.name
    }`;
  }

  /**
   * Creates a new Navigation Property
   * @param {Metadata} metadata instance of the metadata object that keeps service metadata
   * @param {Object} navigationProperty navigation property parsed from metadata
   * @returns {NavigationProperty} association instance @see NavigationProperty.js
   * @memberof NavigationProperty
   */
  createNavigationProperty(metadata, navigationProperty) {
    return new NavigationProperty(this, navigationProperty, metadata);
  }

  /**
   * Set key definiton for the entity set reading
   *
   * @return {NavigationProperty} itself for the chaining
   *
   * @memberof RequestDefinition
   */
  key() {
    return this.isMultiple()
      ? super.key.apply(this, arguments)
      : this.defaultRequest.registerAssociations();
  }
}

module.exports = NavigationProperty;
