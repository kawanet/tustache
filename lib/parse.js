"use strict";

exports.parse = parse;

function parse(source, options) {
  var TAG_MAP = {
    "&": ampersandTag,
    "/": closeTag,
    "!": commentTag,
    "^": invertedSectionTag,
    ">": partialTag,
    "#": sectionTag,
    "{": trippeMustacheTag
  };

  var STANDALONE = {"/": 1, "!": 1, "^": 1, ">": 1, "#": 1};

  var regexp = "{{([^{}]*|{[^{}]*})}}";
  var stack = [{c: []}];
  var tag = options && options.tag;

  source += "";

  if (!tag) {
    source.replace(/{{=(.*?)=}}/, function(match, t, pos) {
      var left = source.substr(0, pos);
      source = source.substr(pos + match.length);

      if (left.search(/(^|\n)[ \t]*$/) > -1 &&
        source.search(/^[ \t]*(\r?\n|$)/) > -1) {
        left = left.replace(/[ \t]*$/, "");
        source = source.replace(/^[ \t]*\r?\n?/, "");
      }

      if (left) append(parse(left, options));

      tag = trim(t);
    });
  }

  if (tag) {
    tag = tag.replace(/[!-.?\[-\]{-}]/g, function(chr) {
      return "\\x" + chr.charCodeAt(0).toString(16);
    });
    regexp = tag.replace(/\s+/, "(.*?)");
  }

  var array = source.split(new RegExp(regexp));
  var last = array.length;

  for (var i = last - 2; i > 0; i -= 2) {
    var left = array[i - 1];
    var right = array[i + 1];

    var standalone = STANDALONE[array[i][0]] &&
      (i === 1 ? left.search(/(^|\n)[ \t]*$/) > -1 : left.search(/\n[ \t]*$/) > -1) &&
      (i === last - 2 ? right.search(/^[ \t]*(\r?\n|$)/) > -1 : right.search(/^[ \t]*\r?\n/) > -1);

    if (standalone) {
      array[i - 1] = left.replace(/[ \t]*$/, "");
      array[i + 1] = right.replace(/^[ \t]*\r?\n?/, "");
    }
  }

  array.forEach(function(str, col) {
    if (col & 1) {
      addTag(str);
    } else {
      addString(str);
    }
  });

  if (stack.length > 1) {
    throw new Error("missing closing tag: " + stack[0].v);
  }

  return stack[0];

  function append(item, child) {
    stack[0].c.push(item);
    if (child) {
      item.c = [];
      stack.unshift(item);
    }
  }

  function addString(str) {
    if (str) append({t: str});
  }

  function addTag(str) {
    var f = TAG_MAP[str[0]];
    if (f) {
      f(trim(str.substr(1)));
    } else {
      addVariable(trim(str));
    }
  }

  // {{&ampersand}}

  function ampersandTag(str) {
    append({v: str, u: 1});
  }

  function trippeMustacheTag(str) {
    return ampersandTag(trim(str.substr(0, str.length - 1)));
  }

  // {{>partial}}

  function partialTag(str) {
    append({v: str, p: 1});
  }

  // {{#section}}

  function sectionTag(str) {
    append({v: str, s: 1}, 1);
  }

  // {{^inverted}}

  function invertedSectionTag(str) {
    append({v: str, i: 1}, 1);
  }

  // {{/section}}

  function closeTag(str) {
    if (!stack.length) {
      throw new Error("Closing tag without opener: " + str);
    }
    var opened = stack[0].v;
    if (opened !== str) {
      throw new Error("Nesting error: " + opened + " vs. " + str);
    }
    stack.shift();
  }

  // {{variable}}

  function addVariable(str) {
    append({v: str});
  }

  // {{! comment }}

  function commentTag() {
    // ignore
  }
}

/**
 * @private
 */

function trim(str) {
  return str.replace(/^\s+/, "").replace(/\s+$/, "");
}
