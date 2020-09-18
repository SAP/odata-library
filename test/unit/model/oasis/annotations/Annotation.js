"use strict";

const assert = require("assert");
const Annotation = require("../../../../../lib/model/oasis/annotations/Annotation");
const builder = {
  buildAnnotation: (x) => new Annotation(x, builder),
  buildCollection: (x) => x,
  buildRecord: (x) => x,
  assignElementValue: () => {},
};

describe("Annotation", function () {
  describe("#constructor()", function () {
    it("initializes properties", function () {
      let md = {
        $: {
          Term: "T1",
          Qualifier: "Q1",
        },
        Annotation: [
          {
            $: {
              Term: "T2",
            },
          },
        ],
      };

      let annotation = new Annotation(md, builder);

      assert.equal(annotation.term, "T1");
      assert.equal(annotation.qualifier, "Q1");
      assert.equal(annotation.raw, md);
      assert.equal(annotation.annotations.length, 1);
      assert.equal(annotation.annotations[0].term, "T2");
    });

    it("throws error on missing term", function () {
      let md = {
        $: {
          Qualifier: "Q1",
        },
      };

      assert.throws(() => new Annotation(md, builder));
    });
  });
});
