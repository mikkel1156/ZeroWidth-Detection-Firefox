//  Dictionary for all the results of a page.
var charDict = {};

//  Outputting errors.
function gotError(error) {
    console.log(`[Zero-Width Detect] ${error}`);
}

//  Handle messages sent to the background script.
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "update-info") {               //  If the type of message we got is 'update-info'.
        //  Insert the character data into the dictionary at the URL of the site.
        charDict[request.url] = request.data;

        //  Update the badge text with how many characters were found.
        browser.browserAction.setBadgeText({
            text: (request.data.length).toString()
        });
    } else if (request.type === "get-chars") {          //  If the type of message we got is 'get-chars'.
        //  Send response containg the characters for the given URL.
        sendResponse({
            data: charDict[request.url]
        });
    }
});

//  Event for when another tab becomes active.
browser.tabs.onActivated.addListener(function(activeInfo) {
    //  Query all the windows to find the active one.
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(function(tabs) {
        //  Set variable to the URL of the window found.
        let url = tabs[0].url;

        if (charDict[url] != null) {                            //  If there IS characters at the URL in the dictionary.
            //  Update the badge text with how many characters were found.
            browser.browserAction.setBadgeText({
                text: (charDict[url].length).toString()
            });
        } else {                                                //  If there ISN'T characters at the URL in the dictionary.
            //  Remove the badge.
            browser.browserAction.setBadgeText({
                text: null
            });
        }
    }, gotError);
});