#!/bin/bash

if [[ -d $1 ]]; then
    rm active
    ln -s $1 active
else
    echo "$1 is not a directory"
    exit 1
fi
