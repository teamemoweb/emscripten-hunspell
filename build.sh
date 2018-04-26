#!/bin/sh

set -ex

pushd hunspell
autoreconf -vfi
emconfigure ./configure
emmake make
popd

rm -r embuild || true
mkdir embuild

em++ \
	-O3 \
	-Oz \
	--llvm-lto 1 \
	-s NO_EXIT_RUNTIME=1 \
	-s EXPORTED_FUNCTIONS="['_Hunspell_create', '_Hunspell_destroy', '_Hunspell_spell', '_Hunspell_suggest', '_Hunspell_free_list']" \
	./hunspell/src/hunspell/.libs/libhunspell-1.6.a \
	-o embuild/hunspell.js

cat LICENSE embuild/hunspell.js > tmp; mv tmp embuild/hunspell.js
cat LICENSE embuild/hunspell.js.mem > tmp; mv tmp embuild/hunspell.js.mem
