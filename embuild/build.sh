#!/bin/sh
em++ \
	-O3 \
	-Oz \
	--llvm-lto 1 \
	-s NO_EXIT_RUNTIME=1 \
	-s EXPORTED_FUNCTIONS="['_Hunspell_create', '_Hunspell_destroy', '_Hunspell_spell', '_Hunspell_suggest', '_Hunspell_free_list']" \
	../hunspell/src/hunspell/.libs/libhunspell-1.6.a \
	-o hunspell.js