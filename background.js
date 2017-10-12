chrome.browserAction.onClicked.addListener(function(tab) {
  sendMessageToCurrentTab({"message": "clicked_browser_action"});
});



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === "open_new_tab") {
    chrome.tabs.create({"url": request.url}, callbackOpenNewTab);
  }
});


function sendMessageToCurrentTab(message) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message);
  });
}

function callbackOpenNewTab(tab) {
  chrome.tabs.executeScript(tab.id, {
    file: 'scripts/rating.js'
  });
}