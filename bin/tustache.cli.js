#!/usr/bin/env node

"use strict";

const fs = require("fs");
const argv = require("process.argv")(process.argv.slice(2));

const tustache = require("../index");

const CONF = {variable: "templates"};

CLI(argv(CONF));

function CLI(context) {
  const args = context["--"];
  const count = args && args.length;

  context.package = require("../package.json");

  // --help
  if (!count || context.help) {
    const templates = require("../asset/help");
    process.stderr.write(templates.help(context, context));
    process.exit(1);
  }

  context.templates = args.map(function(file) {
    let source = fs.readFileSync(file, "utf-8");

    // --trim
    if (context.trim) {
      source = source.replace(/^\s+/mg, "").replace(/\s+\n/g, "\n");
    }

    const item = {};

    item.name = file.split("/").pop().replace(/[^\w\-].+$/, "");
    item.code = tustache.build(tustache.parse(source, context), context);

    return item;
  });

  if (context.runtime) {
    context.embed_render = fs.readFileSync(__dirname + "/../dist/tustache-render.min.js");
  }

  const template = tustache.compile(fs.readFileSync(__dirname + "/../asset/template.txt"), {tag: "[[ ]]"});

  const text = template(context, context);

  // --output=templates.js
  if (context.output) {
    fs.writeFileSync(context.output, text);
  } else {
    process.stdout.write(text);
  }
}
