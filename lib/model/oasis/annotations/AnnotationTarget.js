"use strict";

const ExpressionBuilder = require("./ExpressionBuilder");

/**
 * Envelopes an annotation target:
 *
 * http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Target
 *
 * @class AnnotationTarget
 */
class AnnotationTarget {
  /**
   * Creates an instance of AnnotationTarget.
   *
   * @param {Object} rawMetadata raw metadata object for annotation target object
   * @param {Object} model reference to model which owns the annotation target
   *
   * @memberof AnnotationTarget
   */
  constructor(rawMetadata, model) {
    this.annotations = [];

    // almost all annotation target types must have uniquie name (in some scope)
    // there are 2 exceptions (Return Type, Annotation) that do not have name (in OASIS-CSDL)
    let name = rawMetadata.$.Name ? rawMetadata.$.Name : "";

    Object.defineProperty(this, "raw", {
      get: () => rawMetadata,
    });

    Object.defineProperty(this, "name", {
      get: () => name,
    });

    let extensions = [];
    Object.defineProperty(this, "extensions", {
      get: () => extensions,
    });

    Object.defineProperty(this, "model", {
      get: () => model,
    });
  }

  /**
   * Applies external target annoations.
   *
   * see https://docs.microsoft.com/en-us/openspecs/windows_protocols/mc-csdl/9fb2fa3c-5aac-4430-87c6-6786314b1588
   * see http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_AnnotationswithExternalTargeting
   *
   * @param {Object[]} [annotations] Annotations (container) elements
   */
  applyAnnotations(annotations) {
    // 'Annotations' element may have a qualifier, but there is no more addition info for it and sap doesn't use it, so it is ignored
    // "'Annotations' element MUST contain at least one edm:Annotation element." but ODATA.publish=true services do not comply with this

    let content = [].concat
      .apply(
        [],
        annotations.map((a) => a.Annotation)
      )
      .filter(Boolean)
      .map(ExpressionBuilder.buildAnnotation);
    this.annotations.push.apply(this.annotations, content);
  }

  /**
   * Checks if annotations contains specific term.
   *
   * @param {string} term annotation term to search for.
   * @returns {boolean} true if term is contained in annotations.
   */
  hasTerm(term) {
    return !!this.annotations.find((a) => a.term === term);
  }

  /**
   * Gets legacy api object. (XML casing, maybe some other changes.)
   *
   * @returns {Object} legacy api object
   * @memberof AnnotationTarget
   */
  getLegacyApiObject() {
    let api = {
      Name: this.name,
      Annotations: {
        raw: this.raw,
        hasTerm: (term) => this.hasTerm(term),
      },
    };

    this.extensions.forEach((e) => e.extendLegacyApiObject(api));

    return api;
  }
}

module.exports = AnnotationTarget;
