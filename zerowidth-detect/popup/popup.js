//  Global varibles.
var charCopy = false;
var chars = null;

//  Outputting errors.
function gotError(error) {
    console.log(`Error: ${error}`);
}

//  Updating the popup with new info.
function gotInfo(response) {
    //  Return here if there is no data.
    if (response.data == null)
        return;

    //  Update the characters found element.
    document.getElementById("chars-found").innerHTML = (response.data.length).toString();

    //  Get the amount of bytes the characters take up.
    var bytes = response.data.length * 2;

    //  Update the characters size element.
    document.getElementById("chars-size").innerHTML = bytes.toString();

    //  Update the badge with how many characters were found.
    browser.browserAction.setBadgeText({
        text: (response.data.length).toString()
    });
}

//  Event for when then the copy button is clicked.
document.getElementById("copy-chars").addEventListener("click", function() {
    //  Query for all the open tabs.
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(function(tabs) {
        //  Get the url of the current active tab.
        let url = tabs[0].url;

        //  Send 'get-chars' request to the background script and pass it the active tabs URl.
        browser.runtime.sendMessage({
            type: "get-chars",
            url: url
        }).then(function(response) {
            //  If there is no characters gotten back, display an alert.
            if (response.data == null)
                return alert("No characters to copy.");

            //  Set 'charCopy' trigger to true.
            //  Update the global chars variable with the data we got.
            //  Trigger a copy action.
            charCopy = true;
            chars = response.data;
            document.execCommand("Copy");
        }, gotError);
    }, gotError);
});

//  Query for all the open tabs.
browser.tabs.query({
    currentWindow: true,
    active: true
}).then(function(tabs) {
    //  Get the url of the current active tab.
    let url = tabs[0].url;

    //  Send 'get-chars' request to the background script and pass it the active tabs URl.
    browser.runtime.sendMessage({
        type: "get-chars",
        url: url
    }).then(gotInfo, gotError);
}, gotError);

//  Event for when a copy action is triggered.
document.addEventListener('copy', function(e) {
    //  Check if the 'charCopy' trigger is active.
    if (charCopy) {
        //  Set the clipboard's data to the characters we want to copy.
        e.clipboardData.setData("text/plain", chars);

        //  Reset characters and our 'charCopy' trigger.
        chars = null;
        charCopy = false;

        //  Prevent normal copying.
        e.preventDefault();
    }
});