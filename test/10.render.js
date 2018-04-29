#!/usr/bin/env mocha -R spec

"use strict";

/* jshint unused:false */

var assert = require("assert");
var runtime = require("../lib/render").runtime;
var TITLE = __filename.replace(/^.*\//, "");

describe(TITLE, function() {

  it("text", function() {
    var t = runtime(T => T("Hello, Tustache!"));

    assert.equal(t(), "Hello, Tustache!");
  });

  it("variable", function() {
    var t = runtime(T => T("name", 7));

    assert.equal(t({"name": "Tustache"}), "Tustache");
  });

  it("text and variable", function() {
    var t = runtime(T => "Hello, " + T("name", 7) + "!");

    assert.equal(t({"name": "Tustache"}), "Hello, Tustache!");
    assert.equal(t(), "Hello, !");
  });

  it("section", function() {
    var t = runtime(T => T("foo", 11, T => T("FOO")) + T("bar", 11, T => T("BAR")));

    assert.equal(t({"foo": true, "bar": false}), "FOO");
    assert.equal(t(), "");
  });

  it("inverted section", function() {
    var t = runtime(T => T("foo", 19, T => T("FOO")) + T("bar", 19, T => T("BAR")));

    assert.equal(t({"foo": true, "bar": false}), "BAR");
    assert.equal(t(), "FOOBAR");
  });

  it("escape", function() {
    var t = runtime(T => T("amp", 7) + "<&>" + T("amp", 3));

    assert.equal(t({"amp": "<&>"}), "&lt;&amp;&gt;<&><&>");
    assert.equal(t(), "<&>");
  });

  it("deep variable", function() {
    var t = runtime(T => ("[" + T("aa.bb.cc", 7) + "]"));

    assert.equal(t({aa: {bb: {cc: "DD"}}}), "[DD]");
    assert.equal(t({aa: {bb: {}}}), "[]");
    assert.equal(t({aa: {}}), "[]");
    assert.equal(t(), "[]");
  });

  it("lambda", function() {
    var t = runtime(T => T("aa.bb", 7));

    var context = {aa: {bb: bb}};
    var alt = {alt: 1};

    assert.equal(t(context, alt), "AABB");

    function bb(ctx, second) {
      assert.ok(this, context.aa);
      assert.ok(ctx, context);
      assert.ok(second, alt);
      return "AABB";
    }
  });

  it("partial", function() {
    var t = runtime(T => ("[" + T("foo", 7) + ":" + T("foo", 2) + "]"));
    var context = {foo: "context"};
    var alt = {foo: foo};

    assert.equal(t(context, alt), "[context:alt]");

    function foo(ctx, second) {
      assert.equal(this, alt);
      assert.equal(ctx, context);
      assert.equal(second, alt);
      return "alt";
    }
  });

  it("section and partial", function() {
    var t = runtime(T => ("[ " + T("foo", 11, T => ("[" + T("baz", 2) + "]")) + " ]"));
    var bar = {};
    var context = {foo: [bar, bar], baz: "context"};
    var alt = {baz: baz};

    assert.equal(t(context, alt), "[ [alt][alt] ]");

    function baz(ctx, second) {
      assert.equal(ctx, bar);
      assert.equal(second, alt);
      return "alt";
    }
  });
});
