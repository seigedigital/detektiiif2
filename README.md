# DetektIIIF 2

Completely new revamped Version of DetektIIIF (Version 1: https://github.com/leanderseige/detektiiif)

derived from https://github.com/lxieyang/chrome-extension-boilerplate-react


## Usage

* clone this repo ```git clone https://github.com/seigedigital/detektiiif2```
* ```cd detektiiif2```
* ```npm install```
* ```npm run build``` (one time production) or ```npm start``` (continuous development mode + hot reload)
* provide build folder to Chrome (unpacked in Developer Mode or as ZIP via the Chrome Web Store)

## Build-time Theming

Duplicate one of the folders in src/themes for your own theme
```
cp -r detektiiif2 myinstitution
```
Modify the files in the new folder as you wish and switch the symlink `active` to the desired theme:
```
rm active && ln -s myinstitution active
```
Rebuild the extension. That's it!
