"use strict";

const assert = require("assert").strict;
const aggregate = require("../../../lib/model/aggregate");

class A {
  constructor() {
    this.A = 1;
  }
  methodA() {}
}

class B {
  constructor() {
    this.B = 1;
  }
  methodB() {}
}

describe("lib/model/aggregate", function () {
  it("aggregate", function () {
    class C extends aggregate(A, B) {}
    let instanceC = new C();

    assert.equal(instanceC.A, 1);
    assert.equal(instanceC.B, undefined);
    assert.equal(instanceC.methodA, A.prototype.methodA);
    assert.equal(instanceC.methodB, B.prototype.methodB);
  });
  describe("aggregate._.copyNonSpecialProperties", function () {
    it("copy properties", function () {
      let target = {
        foo: "FOO",
      };
      aggregate._.copyNonSpecialProperties(target, {
        bar: "BAR",
      });
      assert.deepEqual(target, {
        foo: "FOO",
        bar: "BAR",
      });
    });
    it("ignore special properties", function () {
      let target = {
        foo: "FOO",
      };
      aggregate._.copyNonSpecialProperties(target, {
        constructor: "CONSTRUCTOR",
        prototype: "PROTOTYPE",
        arguments: "ARGUMENTS",
        caller: "CALLER",
        name: "NAME",
        bind: "BIND",
        call: "CALL",
        apply: "APPLY",
        toString: "TO_STRING",
        length: "LENGTH",
      });
      assert.deepEqual(target, {
        foo: "FOO",
      });
    });
  });
});
