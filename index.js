"use strict";

var parse = exports.parse = require("./lib/parse").parse;
var build = exports.build = require("./lib/build").build;
var runtime = exports.runtime = require("./lib/runtime").runtime;

exports.compile = compile;

function compile(t, options) {
  t = parse(t, options);

  t = build(t, options);

  /* jshint -W061 */
  t = Function("return " + t)();

  return runtime(t, options);
}
