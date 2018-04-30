"use strict";

exports.build = build;

function build(source, options) {
  var es5 = options && options.es5;
  var prefix = es5 ? "function(T){return " : "T=>";
  var suffix = es5 ? "}" : "";

  return outer(source.c);

  function outer(array) {
    return prefix + array.map(inner).join("+") + suffix;
  }

  function inner(item) {
    if (item.t) {
      return quoteText(item.t);
    }

    var out = "T(" + quoteText(item.v) + ",";

    var flag = 0;
    // bit 0 {{.foo}} OR {{foo}}
    if (!item.p) flag |= 1;

    // bit 1 {{>foo}} OR {{foo}}
    if (!item.d) flag |= 2;

    // bit 2 {{&escaped}}
    if (!item.u && !item.s && !item.i) flag |= 4;

    // bit 3 {{#section}} {{/section}}
    if (item.s) flag |= 8;

    // bit 4 {{^inverted}} {{/inverted}}
    if (item.i) flag |= 16;

    out += flag;

    var children = item.c;
    if (children && children.length) {
      out += "," + outer(children);
    }

    out += ")";
    return out;
  }
}

/**
 * @private
 */

var QUOTE_MAP = {
  "\t": "\\t", // 0x09
  "\n": "\\n", // 0x0a
  "\r": "\\r", // 0x0d
  "'": "\\'", // 0x22
  "\\": "\\\\" // 0x5c
};

function escapeChar(chr) {
  var code = chr.charCodeAt(0);
  return QUOTE_MAP[chr] || ((code < 16 ? "\\x0" : "\\x") + code.toString(16).toUpperCase());
}

function quoteText(str) {
  return "'" + (str ? str.replace(/([\x00-\x1F'\\])/g, escapeChar) : "") + "'";
}
