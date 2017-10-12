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
  var files = [
    "lib/jquery-3.2.1.min.js",
    "lib/jquery.xpath.min.js",
  ];

  concatenateInjections(tab.id, files, "scripts/rating.js");
}



function concatenateInjections(tabId, files, lastFile){

  if( typeof lastFile !== 'undefined' ) 
    files = files.concat([lastFile]);

  var i = files.length;
  var idx = 0 ;

  (function (){
    var that = arguments.callee;
    idx++;
    if(idx <= i){
      var f = files[idx-1];
      chrome.tabs.executeScript(
        tabId, 
        { 
          file: f 
        }, 
        function() { 
          that(idx);
        });
    }
  })();
}

