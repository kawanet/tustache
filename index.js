"use strict";

exports.parse = require("./lib/parse").parse; // UGLIFY
exports.build = require("./lib/build").build; // UGLIFY
exports.runtime = require("./lib/runtime").runtime; // UGLIFY
exports.compile = compile;

function compile(t, options) {
  t = exports.parse(t, options);

  t = exports.build(t, options);

  /* jshint -W061 */
  t = Function("return " + t)();

  return exports.runtime(t, options);
}
