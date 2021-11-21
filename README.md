# DetektIIIF 2

Completely new revamped Version of DetektIIIF (Version 1: https://github.com/leanderseige/detektiiif)

derived from https://github.com/lxieyang/chrome-extension-boilerplate-react


## Usage

* clone this repo ```git clone https://github.com/seigedigital/detektiiif2```
* ```cd detektiiif2```
* ```npm install```
* ```npm run build``` or ```npm start```
* provide build folder to Chrome (unpacked in Developer Mode or as ZIP via the Chrome Web Store)

## Build-time Theming

Duplicate one of the folders in src/themes for your themes
```
cp -r detektiiif2 myinstitution
```
Modify the files in the new folder as you wish and edit ```src/themes/Selector.js``` to use the new theme:
```
// import Theme from './detektiiif2/Theme.js'
// import Theme from './anotheruniversity/Theme.js'
import Theme from './myinstitution/Theme.js'

export default Theme
```
That's it!
