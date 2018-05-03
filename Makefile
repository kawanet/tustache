#!/usr/bin/env bash -c make

MAIN_OUT=dist/tustache.min.js
MAIN_SRC=index.js lib/*.js

RUNTIME_OUT=dist/tustache-render.min.js
RUNTIME_SRC=lib/render.js

HELP_OUT=asset/help.js
HELP_SRC=asset/help.txt

CLI=./bin/tustache.cli.js

CLASS=tustache

ALL=$(RUNTIME_OUT) $(MAIN_OUT) $(HELP_OUT)

all: $(ALL)

test: all fetch-specs
	./node_modules/.bin/mocha test
	./node_modules/.bin/jshint .
	$(CLI) asset/*.html --runtime | node
	$(CLI) --help 2>&1 | grep "github.com/kawanet/tustache" > /dev/null

clean:
	/bin/rm -f $(ALL)

$(RUNTIME_OUT): $(RUNTIME_SRC)
	cat $^ | grep -v '// UGLIFY' | ./node_modules/.bin/uglifyjs --toplevel -m -o $@

$(MAIN_OUT): $(MAIN_SRC)
	cat $^ | grep -v ' // UGLIFY' | ./node_modules/.bin/uglifyjs --toplevel -m --wrap tustache -o $@

$(HELP_OUT): $(HELP_SRC) $(RUNTIME_OUT)
	$(CLI) --variable=exports --tag="[[ ]]" --runtime --output=$@ -- $<

SPECS=comments delimiters interpolation inverted partials sections '~lambdas'

fetch-specs: test/spec/specs/interpolation.json

test/spec/specs/interpolation.json:
	for spec in $(SPECS); do \
	curl -o "test/spec/specs/$$spec.json" "https://rawgit.com/mustache/spec/master/specs/$$spec.json"; \
	done

mocha:
	./node_modules/.bin/mocha test

jshint:
	./node_modules/.bin/jshint .

watch:
	while :; do make watching; sleep 1; done

watching: test/.watching

test/.watching: $(MAIN_SRC) $(HELP_SRC) Makefile
	make mocha jshint all && touch test/.watching

.PHONY: all clean test
