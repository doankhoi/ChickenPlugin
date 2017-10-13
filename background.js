var LIB_FILES = [
  "lib/jquery-3.2.1.min.js",
  "lib/jquery.xpath.min.js",
  "lib/firebase.js",
  "utils/mouse.js",
  "utils/firebase_client.js"
];

var MAPS_URLS_PARSE = {
  'RATINGS': 'https://www.airbnb.com/stats/ratings',
  'EARNINGS': 'https://www.airbnb.com/stats/earnings',
  'VIEWS': 'https://www.airbnb.com/stats/views/',
  'STANDARDS': 'https://www.airbnb.com/stats/standards'
};

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({"url": MAPS_URLS_PARSE['RATINGS']}, callbackOpenNewTab);
});

function sendMessageToCurrentTab(message) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message);
  });
}

function callbackOpenNewTab(tab) {
  concatenateInjections(tab.id, "scripts/rating.js");
}


function concatenateInjections(tabId, lastFile){
  var files = LIB_FILES;
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

