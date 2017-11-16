
document.addEventListener('DOMContentLoaded', () => {
    var pushData = document.getElementById('push-data');
    var exportData = document.getElementById('export-data');

    pushData.addEventListener('click', function() {
        // Send event click push data to server
        chrome.runtime.sendMessage({
            message: "push_data"
        });
    });

    exportData.addEventListener('click', function() {
        chrome.runtime.sendMessage({
            message: "export-data"
        });
    });
});