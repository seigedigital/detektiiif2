export default function v2GetManifestThumbnail(manifest) {

  if('thumbnail' in manifest) {
    return getStringOrId(manifest['thumbnail'])

  } else if('thumbnail' in manifest['sequences'][0]['canvases'][0]) {
    return getStringOrId(manifest['sequences'][0]['canvases'][0]['thumbnail'])

  } else if('service' in manifest['sequences'][0]['canvases'][0]['images'][0]['resource']) {
    return manifest['sequences'][0]['canvases'][0]['images'][0]['resource']['service']['@id']+'/full/,100/0/default.jpg';

  } else {
    return  manifest['sequences'][0]['canvases'][0]['images'][0]['resource']['@id'];

  }
}


function getStringOrId(i) { // return String or ID
  if(typeof i === 'object') {
      if('@id' in  i) {
        return i['@id']
      }
      if('id' in  i) {
        return i['id']
      }
  }
  return i
}
