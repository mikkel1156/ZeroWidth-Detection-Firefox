//  Global values.
var getClipboard = false;
var setClipboard = false;
var newClipboard = null;

//  Outputting errors.
function handleError(error) {
    console.log(`[Zero-Width Detect] ${error}`);
}

//  Handle messages sent to the background script.
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Request type: " + request.type);
    if (request.type === "update-info") {               //  If the type of message we got is 'update-info'.
    }
});

function scanForZW() {
    console.log("[Zero-Width Detect]: Scanning site.");
    //  Setup the DOM walker, filtering only to text nodes.
    var walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    //  Variables.
    var allNodes = [];                  //  Array containing all nodes found with zero-width characters.
    var replace = "🕵";                 //  Variable to replace foudn characters with.
    var characters = "";                //  All the characters found.
    var zwRE = RegExp("(‍|‌|​|⁠)", "g");    //  Regular expression for all the zero-width characters.

    //  Iterate over all the nodes the walker finds.
    while(node = walker.nextNode()) {
        //  Check if the text in the node contains any zero-width characters.
        if (zwRE.test(node.nodeValue)) {
            let matches = node.nodeValue.match(zwRE);
            //  Get all zero-width characters and add them to characters.
            for (let key in matches) {
                if ( Number.isInteger(parseInt(key)) ) {
                    characters += matches[key];
                }
            }
            allNodes.push(node);
        }
    }

    //  Send message to update the background script with the info we found.
    browser.runtime.sendMessage({
        type: "update-info",
        data: characters,
        url: window.location.href
    }).then(null, handleError);

    //  Replacing the text in all nodes found.
    function replaceNodes() {
        //  Iterate over all the nodes.
        for (var i = 0; i < allNodes.length; i++) {
            //  Update the text of the current node with the orignal text but replacing all zero-width characters with the replace string.
            allNodes[i].nodeValue = allNodes[i].nodeValue.replace(zwRE, replace);
        }
    }

    //  Get the whitelist.
    browser.storage.local.get("whitelist").then(function(result) {
        //  If there is no whitelist or it is empty.
        if (!result.whitelist) {
            //  Log that no whitelist was found.
            console.log("[Zero-Width Detect]: No whitelist found.");

            //  Get the string to replace zero-width characters with.
            browser.storage.local.get("replace").then(function(result) {
                //  If one is actually set, log the use of a custom one and update the replace string.
                if (result.replace) {
                    console.log("[Zero-Width Detect]: Using custom replace string.");
                    replace = result.replace;
                }

                //  Replace all the text in the nodes.
                replaceNodes();
            }, handleError);
        }

        //  Split the whitelist characters into an array by the pipe character.
        var split = result.whitelist.split("|");
        for (var index in split) {
            //  Check if the result actually contains something.
            if (split[index]) {
                //  Set domain to the result and replace wildcards with soem regex.
                var domain = split[index];
                domain = domain.replace(/\*/i, "([\w\.]+)");

                //  Make new domain regular expression based on the domain.
                var domainRE = new RegExp("^https?:\/\/(www\.)?"+domain+"(\/.*)?", "i")

                //  If this tab is part of the whitelisted domain, stop script here.
                if (domainRE.test(window.location.href)) {
                    return;
                }
            }
        }

        //  Get the string to replace zero-width characters with.
        browser.storage.local.get("replace").then(function(result) {
            //  If one is actually set, log the use of a custom one and update the replace string.
            if (result.replace) {
                console.log("[Zero-Width Detect]: Using custom replace string.");
                replace = result.replace;
            }
            //  Replace all the text in the nodes.
            replaceNodes();
        }, handleError);
    }, handleError);
}

//  Event for when a copy action is triggered.
document.addEventListener('copy', function(e) {
    //  Check if the 'check clipboard' option is set.
    browser.storage.local.get("check_clipboard").then(function(result) {
        if (result.check_clipboard) {
            console.log("[Zero-Width Detect]: Checking clipboard.");

            //  Set 'getClipboard' trigger to true.
            getClipboard = true;

            //  Trigger a paste action.
            document.execCommand("Paste");
        }
    }, handleError);

    if (setClipboard) {
        //  Set the clipboard's data to the stripped clipboard data.
        e.clipboardData.setData("text/plain", newClipboard);
        newClipboard = null;

        //  Reset 'setClipboard' trigger.
        setClipboard = false;

        //  Prevent normal pasting.
        e.preventDefault();
    }
});

//  Event for when a copy action is triggered.
document.addEventListener('paste', function(e) {
    //  Check if the 'getClipboard' value is set.
    if (getClipboard) {
        //  Get the clipboard's data and store it in a variable.
        let clipboardData = (e.clipboardData || window.clipboardData).getData('text');

        //  Regular expression for all the zero-width characters.
        var zwRE = RegExp("(‍|‌|​|⁠)", "g");

        //  Check if the text in the node contains any zero-width characters.
        if (zwRE.test(clipboardData)) {
            console.log("[Zero-Width Detect]: Zero-width characters found in clipboard. Removing them.");

            //  Strip all zero-width characters.
            newClipboard = clipboardData.replace(zwRE, "")

            //  Set 'setClipboard' trigger to true.
            setClipboard = true;

            //  Trigger a copy action.
            document.execCommand("Copy");
        }

        //  Reset 'getClipboard' trigger.
        getClipboard = false;

        //  Prevent normal pasting.
        e.preventDefault();
    }
});

//  Wait for the DOM to be loaded.
document.addEventListener("DOMContentLoaded", function(event) {
    scanForZW();
});