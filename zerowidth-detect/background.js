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
        /*browser.storage.local.get("replace").then(function(result) {
            if (result.replace == null || result.replace == "") {
                console.log("No replace");
                newHTML = request.data.replace(pattern, "🕵");
            } else {
                console.log("Custom replace");
                newHTML = request.data.replace(pattern, result.replace);
            }
            console.log("NEW HTML: \n" + newHTML);
        }, gotError);
        setTimeout(() => {
            sendResponse({
                data: newHTML
            });
        }, 2000);*/
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