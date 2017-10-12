var MAPS_URLS_PARSE = {
  'RATINGS': 'https://www.airbnb.com/stats/ratings',
  'EARNINGS': 'https://www.airbnb.com/stats/earnings',
  'VIEWS': 'https://www.airbnb.com/stats/views/',
  'STANDARDS': 'https://www.airbnb.com/stats/standards'
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "clicked_browser_action") {
      console.log("Enter here");
      chrome.runtime.sendMessage({"message": "open_new_tab", "url": MAPS_URLS_PARSE['RATINGS']});
    }
  }
);


chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.message === "open_pull_request") {
      console.log("I'm here:)");
    }
  }
);
