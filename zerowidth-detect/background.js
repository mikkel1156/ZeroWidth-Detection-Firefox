var charDict = {};

function gotError(error) {
    console.log(`Error: ${error}`);
}

//  Handle message
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "html") {
        var pattern = /(‍|‌|​|⁠)/gi
        var temp = request.data.match(pattern);

        var characters = "";
        for (var index in temp) {
            characters += temp[index];
        }

        charDict[request.url] = characters;
        browser.browserAction.setBadgeText({
            text: charDict[request.url].length.toString()
        });

        var newHTML = request.data.replace(pattern, "🕵");
        sendResponse({
            data: newHTML
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
                text: charDict[tab.url].length.toString()
            });
        } else {
            browser.browserAction.setBadgeText({
                text: null
            });
        }
    }, gotError);
});