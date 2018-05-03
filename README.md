# Tustache - Tiny {{Mustache}} Templating Engine [![Build Status](https://travis-ci.org/kawanet/tustache.svg?branch=master)](https://travis-ci.org/kawanet/tustache)

- Templates: `{{#section}}` `{{> partial}}` `{{lambda}}` `{{/section}}`
- Compiler: Precompile a `.js` file for Node.js and Web browsers ready.
- Runtime: Embeddable tiny 1KB render requires no dependency modules.

## Synopsis

```js
const tustache = require("tustache");

const template = "hello, {{name}}!";

const render = tustache.compile(template);

const context = {name: "Ryu"};

console.log(render(context)); // => "Hello, Ryu!"
```

## CLI Compiler

```sh
tustache --help

tustache --variable=exports --runtime *.html --output=templates.js
```

HTML Template: `names.html`

```html
<ul>
  {{#list}}
  <li>{{name}}</li>
  {{/list}}
</ul>
```

Node.js:

```js
const templates = require("./templates");

const context = {list: [{name: "Ryu"}, {name: "Ken"}]};

console.log(templates.names(context));
```

Browser:

```html
<script src="./templates.js"></script>
<script>
    const context = {list: [{name: "Ryu"}, {name: "Ken"}]};
    document.body.innerHTML = exports.sample1(context);
</script>
```

Result:

```html
<ul>
  <li>Ryu</li>
  <li>Ken</li>
</ul>
```

## Templating Syntax

The compiled render method accepts a pair of arguments: the main (current) context and the alternative (fallback) context.

```
const tustache = require("tustache");

const template = "{{foo}}-{{.foo}}-{{>foo}} {{bar}}-{{.bar}}-{{>bar}}";

const context = { foo: "[FOO]" };
const alt = { foo: "[foo]", bar: "[bar]" };

const render = tustache.compile(template);

console.log(render(context, alt)); // => "[FOO]-[FOO]-[foo] [bar]--[bar]"
```

Interpolation:

| Prefix | Behavior | Example | Main context | Alt context  | HTML escape |
| --- | --- | --- | --- | --- | --- |
| - | Normal | `{{foo.bar}}` | Yes (primary) | Yes (fallback) | Escaped |
| `&` | Unescaped | `{{&foo.bar}}` | Yes (primary) | Yes (fallback) | Raw |
| `.` | Main only | `{{.foo.bar}}` | Yes | No | Escaped |
| `>` | Alt only | `{{>foo.bar}}` | No | Yes | Raw |

Section:

```
{{# section }} show this when true {{/ section }}

{{^ inverted }} show this when false {{/ inverted }}
```

Comment: (just ignored)

```
{{! comment }}
```

Triple Mustache: (rendered without HTML escaping)

```
{{{ foo.bar }}}

{{& foo.bar }} // same
```

Patial: (as a lambda stored in the alt context)

```
{{> partial }}
```

Altering Delimiter: (tag switching)

```
{{= <% %> =}}

<%# section %> <% foo.bar %> <%/ section %>
```

## Incompatibility

It passes more than 90% of the original [Mustache spec](https://github.com/mustache/spec) test suite.
The rest of the tests are skipped in due to changes made for security or performance reasons.
The following minor features are not supported by the module.

- A lambda's return value should be parsed.
- All elements on the context stack should be accessible.
- Each line of the partial should be indented before rendering.
- Lambdas used for inverted sections should be considered truthy.
- Lambdas used for sections should receive the raw section string.

### GitHub

- [https://github.com/kawanet/tustache](https://github.com/kawanet/tustache)

### The MIT License (MIT)

Copyright (c) 2018 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
