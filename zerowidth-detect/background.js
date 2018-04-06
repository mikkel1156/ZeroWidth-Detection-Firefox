var charDict = {};

function gotError(error) {
    console.log(`Error: ${error}`);
}

//  Handle messages
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "update-info") {
        charDict[request.url] = request.data;
        browser.browserAction.setBadgeText({
            text: (request.data.length/2).toString()
        });
    } else if (request.type === "get-chars") {
        sendResponse({
            data: charDict[request.url]
        });
    }
});

browser.tabs.onActivated.addListener(function(activeInfo) {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(function(tabs) {
        let tab = tabs[0]
        if (charDict[tab.url] != null) {
            browser.browserAction.setBadgeText({
                text: (charDict[tab.url].length/2).toString()
            });
        } else {
            browser.browserAction.setBadgeText({
                text: null
            });
        }
    }, gotError);
});