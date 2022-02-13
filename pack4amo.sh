#!/bin/bash

if [[ -z "${1}" ]]; then
  echo "No output folder defined."
else
  rm -rf build/*
  varmanversion=$(jq -r .manifest_version src/themes/manifest.json)
  if [ "$varmanversion" != "2" ]; then
    echo "Firefox requires manifest version 2."
    exit
  fi
  varversion=$(jq -r .version src/themes/manifest.json)
  varname=$(jq -r .name src/themes/manifest.json | tr ' ' '_')
  NODE_ENV=production
  npm run "buildv$varmanversion"
  (cd build/ ; zip -r "../$1/$varname-$varversion-M$varmanversion-forAMO-build-$(date +%s).zip" ./ )
fi
