#!/bin/bash

if [[ -z "${1}" ]]; then
  echo "No output folder defined."
else
  rm -rf build/*
  varmanversion=$(jq -r .manifest_version src/themes/manifest.json)
  if [ "$varmanversion" != "3" ]; then
    echo "Chrome requires manifest version 3."
    exit
  fi
  varversion=$(jq -r .version src/themes/manifest.json)
  varname=$(jq -r .name src/themes/manifest.json | tr ' ' '_')
  NODE_ENV=production
  npm run "buildv$varmanversion"
  zip -r "$1/$varname-$varversion-M$varmanversion-forCWS-build-$(date +%s).zip" build/
fi
