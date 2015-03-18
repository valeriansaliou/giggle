#!/bin/sh

##
#  Giggle.js
#  Deployment script
#
#  Author: Valérian Saliou https://valeriansaliou.name/
#
#  Copyright: 2015, Valérian Saliou
#  License: Mozilla Public License v2.0 (MPL v2.0)
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
