#!/bin/sh

##
#  JSJaCJingle.js
#  Deployment script
#
#  Copyright 2014, FrenchTouch Web Agency
#  Author: Valérian Saliou https://valeriansaliou.name/
##

realpath() {
  [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

PROJECT_DIR=$(dirname $(realpath "$0"))"/../"


echo "Deploying JSJaCJingle.js..."

cd $PROJECT_DIR

npm install
grunt build

echo "Done."
