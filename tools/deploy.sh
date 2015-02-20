#!/bin/sh

##
#  Giggle.js
#  Deployment script
#
#  Copyright 2015, Hakuma Holdings Ltd.
#  Author: Valérian Saliou https://valeriansaliou.name/
##

ABSPATH=$(cd "$(dirname "$0")"; pwd)
BASE_DIR="$ABSPATH/../"


echo "Deploying Giggle.js..."

cd "$BASE_DIR"

npm install && grunt build
rc=$?

# Check for errors
if [ $rc = 0 ]; then
  echo "Done."
else
  echo "Error."
fi

exit $rc
