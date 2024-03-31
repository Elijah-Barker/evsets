#!/usr/bin/env bash

# google-chrome-stable --user-data-dir=/tmp/tmp.u9lo18kaTh --js-flags='--allow-natives-syntax' http://localhost:8000/ | ./verify_addr.sh

node --no-experimental-fetch main.mjs $*