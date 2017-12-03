
document.addEventListener('DOMContentLoaded', () => {
    var pushData = document.getElementById('push-data');
    var exportData = document.getElementById('export-data');
    var LINK_REVIEWS = "https://www.airbnb.com/stats/ratings";

    pushData.addEventListener('click', function() { 
        chrome.tabs.create({'url': LINK_REVIEWS}, function(tab) {
            chrome.runtime.sendMessage({
                message: "push_data"
            });
        });
    });

    exportData.addEventListener('click', function() {
        chrome.tabs.create({'url': LINK_REVIEWS}, function(tab) {
            chrome.runtime.sendMessage({
                message: "export-data"
            });
        });
    });
});