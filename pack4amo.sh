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
  zeit=$(date +%s)
  (cd build/ ; zip -r "../$1/$varname-$varversion-M$varmanversion-forAMO-build-$zeit.zip" ./ )
  tar --exclude './node_modules' --exclude './build' --exclude './.git' -cvzf "$1/$varname-$varversion-M$varmanversion-forAMO-source-$zeit.tar.gz" ./
fi
