"use strict";

exports.build = build;

function build(source, options) {
  var es5 = options && options.es5;
  var prefix = es5 ? "function(T){return " : "T=>";
  var suffix = es5 ? "}" : "";

  return outer(source);

  function outer(item) {
    return prefix + join(item.c) + suffix;
  }

  function join(array) {
    return array.map(inner).join("+") || '""';
  }

  function inner(item) {
    if (item.t) {
      return quoteText(item.t);
    }

    if (!("v" in item) && item.c) {
      return join(item.c);
    }

    var flag = 0;
    var v = item.v;
    var chr = v && v[0];
    var dot = chr === "." && v.length > 1;
    var gt = chr === ">";

    if (dot || gt) v = v.substr(1);

    // bit 0 {{.foo}} OR {{foo}}, NOT {{>foo}}
    if (!item.p && !gt) flag |= 1;

    // bit 1 {{>foo}} OR {{foo}}, NOT {{.foo}}
    if (!dot) flag |= 2;

    // bit 2 {{&escaped}} OR {{{escaped}}}
    if (!item.u && !item.s && !item.i && !item.p) flag |= 4;

    // bit 3 {{#section}} {{/section}}
    if (item.s) flag |= 8;

    // bit 4 {{^inverted}} {{/inverted}}
    if (item.i) flag |= 16;

    var out = "T(" + quoteText(v) + "," + flag;

    if (item.c && item.c.length) {
      out += "," + outer(item);
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
