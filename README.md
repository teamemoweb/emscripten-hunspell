# emscripten-hunspell

This repo is a demo for compiling the [hunspell spell checking library](http://hunspell.github.io/) with [emscripten](http://emscripten.org) to JavaScript for client side spellchecking.

## Building hunspell with emscripten

You must have emscripten and autoreconf installed. You can use the docker image of apiaryio:

    docker run --rm -v $(pwd):/src -ti apiaryio/emcc bash
    apt-get install dh-autoreconf

Making hunspell:

    cd hunspell
    autoreconf -vfi
    emconfigure ./configure
    emmake make

## Creating the js file

    cd jsbuild
    ./build.sh

## Running the demo:

    python -m SimpleHTTPServer 8080

Open `http://localhost:8080/demo.html` in your Browser.