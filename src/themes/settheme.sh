#!/bin/bash

if [[ -z $1 ]] || [[ -z $2 ]]; then
  echo "Usage: ./settheme <path/to/theme/folder> [v2|v3]"
  exit 1
fi

versions=("v2" "v3")
if [[ ! ${versions[@]} =~ $2 ]]; then
  echo "Please specify the desired manifest version (v2 or v3)."
  exit 1
fi

if [[ ! -d $1 ]]; then
    echo "$1 is not a directory"
    exit 1
fi

rm active
rm manifest.json
ln -s $1 active
ln -s "$1/manifest-$2.json" manifest.json
