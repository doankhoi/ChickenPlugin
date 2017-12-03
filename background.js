function sendMessageToCurrentTab(message, callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message, callback);
  });
}

// Handle push_data
function callBackPushData(response) {

}

// Listener message from popup.js or content.js
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  console.log("Enter background: " + request.message);
  setTimeout(function() {
    sendMessageToCurrentTab({message: request.message}, callBackPushData);
    console.log("Send message: " + request.message);
  }, 10000);
});

