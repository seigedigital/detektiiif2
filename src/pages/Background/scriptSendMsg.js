chrome.runtime.sendMessage(
  {type: 'docLoad', doc: document.documentElement.innerHTML}
)
