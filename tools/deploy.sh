#!/bin/sh

##
#  JSJaCJingle.js
#  Deployment script
#
#  Copyright 2014, FrenchTouch Web Agency
#  Author: Valérian Saliou https://valeriansaliou.name/
##

ABSPATH=$(cd "$(dirname "$0")"; pwd)
BASE_DIR="$ABSPATH/../"


echo "Deploying JSJaCJingle.js..."

cd $BASE_DIR

npm install
grunt build

echo "Done."
