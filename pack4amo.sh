#!/bin/bash

if [[ -z "${1}" ]]; then
  echo "No output folder defined."
else
  rm -rf build/*
  NODE_ENV=production
  npm run buildv2
  (cd build/ ; zip -r $1/detektiiif2-build-$(date +%s).zip ./ )
fi
