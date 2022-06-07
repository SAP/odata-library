"use strict";

const _ = require("lodash");
const assert = require("assert").strict;
const AnnotationTarget = require("../../../../../lib/model/oasis/annotations/AnnotationTarget");

function applyAnnotationsToTarget() {
  let target = new AnnotationTarget({
    $: {
      Name: "name",
    },
  });

  target.applyAnnotations([
    {
      $: {},
      Annotation: [
        {
          $: {
            Term: "T1",
          },
        },
        {
          $: {
            Term: "T2",
          },
        },
      ],
    },
  ]);

  return target;
}

describe("AnnotationTarget", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let md = {
        $: {
          Name: "name",
        },
      };

      let target = new AnnotationTarget(md, "MODEL");

      assert.equal(target.name, "name");
      assert.equal(target.raw, md);
      assert.ok(_.isArray(target.annotations));
      assert.equal(target.model, "MODEL");
    });

    it("allows empty name", function () {
      let target = new AnnotationTarget({
        $: {},
      });

      assert.ok(!target.name);
    });
  });

  describe(".applyAnnotations()", function () {
    it("adds annotations to MD and property", function () {
      let target = applyAnnotationsToTarget();
      assert.equal(target.annotations.length, 2);
    });

    it("ignore common 'ODATA.publish: true' services errors", function () {
      let target = applyAnnotationsToTarget();
      let invalidAnno = {
        $: {},
      };

      target.applyAnnotations([invalidAnno]);
    });

    it("throws error on aplying invalid annotations", function () {
      let target = applyAnnotationsToTarget();
      let invalidAnno = {
        $: {},
        Annotation: [{}],
      };

      assert.throws(() => target.applyAnnotations([invalidAnno]));
    });
  });

  describe(".hasTerm()", function () {
    it("finds existing terms", function () {
      let target = applyAnnotationsToTarget();
      assert.ok(target.hasTerm("T1"));
      assert.ok(target.hasTerm("T2"));
      assert.ok(!target.hasTerm("TN"));
    });
  });

  describe(".getLegacyApiObject()", function () {
    it("implements annotations api", function () {
      let api = applyAnnotationsToTarget().getLegacyApiObject();
      assert.equal(api.Name, "name");
      assert.ok(_.has(api, "Annotations"));
      assert.ok(api.Annotations.hasTerm("T1"));
      assert.ok(_.has(api.Annotations, "raw"));
    });
  });
});
