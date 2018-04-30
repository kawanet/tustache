// runtime.js

exports.runtime = runtime;

/**
 * @param func {function}
 * @return {function}
 */

function runtime(func) {
  return t;

  /**
   * @param context {object}
   * @param alt {object}
   * @return {string}
   */

  function t(context, alt) {
    return func(T);

    /**
     * @param val {string}
     * @param bit {number}
     * @param func {function}
     * @return {string}
     */

    function T(val, bit, func) {
      var t;
      if (!bit) return val;

      if (bit & 3) {
        if (val === ".") {
          val = context;
        } else {
          var parent, i;
          var keys = val.split(".");
          var length = keys.length;
          val = "";

          // bit 0 {{.foo}} OR {{foo}}

          if (bit & 1) {
            val = context;
            for (i = 0; val && i < length; i++) {
              parent = val;
              val = val[keys[i]];
            }
          }

          // bit 1 {{>foo}} OR {{foo}}

          if ((bit & 2) && !val) {
            val = alt;
            for (i = 0; val && i < length; i++) {
              parent = val;
              val = val[keys[i]];
            }
          }

          if ("function" === typeof val) {
            val = val.call(parent, context, alt);
          }
        }
      }

      // bit 3 {{#section}} {{/section}}

      if (bit & 8) {
        if (Array.isArray(val)) {
          val = val.map(call).join("");
        } else {
          val = val ? call("object" === typeof val ? val : context) : "";
        }
      }

      // bit 4 {{^inverted}} {{/inverted}}

      if (bit & 16) {
        val = val ? "" : call(context);
      }

      if (val == null) val = "";

      if ("string" !== typeof val) val += "";

      // bit 2 {{&escaped}}

      if (bit & 4) {
        val = val.replace(/[<"&>]/g, escapeHTML);
      }

      return val;

      function call(current) {
        if (!func) return "";
        if (!t) t = runtime(func);
        return t(current, alt);
      }
    }
  }
}

/**
 * @private
 */

var ESCAPE_HTML = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;"
};

function escapeChar(chr) {
  return ESCAPE_HTML[chr];
}

function escapeHTML(str) {
  return str.replace(/[<"&>]/g, escapeChar);
}
