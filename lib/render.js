// render.js

exports.render = (function(ESCAPE) {
  return render;

  /**
   * @name render
   * @param func {function}
   * @param context {object}
   * @param alt {object}
   * @return {string}
   */

  function render(func, context, alt) {
    return func(T);

    /**
     * @name T
     * @param val {string}
     * @param bit {number}
     * @param func {function}
     * @return {string}
     */

    function T(val, bit, func) {
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
          val = val ? call(context) : "";
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
        val = val.replace(/[<"&>]/g, escape);
      }

      return val;

      function call(current) {
        return render(func, current, alt);
      }
    }
  }

  function escape(chr) {
    return ESCAPE[chr];
  }
})({
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;"
});
