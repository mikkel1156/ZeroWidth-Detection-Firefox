var charCopy = false;
var chars = null;

function gotError(error) {
    console.log(`Error: ${error}`);
}

function gotInfo(response) {
    if (response.data == null)
        return;

    document.getElementById("chars-found").innerHTML = response.data.length.toString();
    var bytes = response.data.length * 2;
    document.getElementById("chars-size").innerHTML = bytes.toString();
    browser.browserAction.setBadgeText({
        text: response.data.length.toString()
    });
}

document.getElementById("copy-chars").addEventListener("click", function() {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(function(tabs) {
        let tab = tabs[0];
        browser.runtime.sendMessage({
            type: "get-chars",
            url: tab.url
        }).then(function(response) {
            if (response.data == null)
                return alert("No characters to copy.");

            charCopy = true;
            chars = response.data;
            document.execCommand("Copy");
        }, gotError);
    }, gotError);
});

browser.tabs.query({
    currentWindow: true,
    active: true
}).then(function(tabs) {
    let tab = tabs[0];
    browser.runtime.sendMessage({
        type: "get-chars",
        url: tab.url
    }).then(gotInfo, gotError);
}, gotError);

document.addEventListener('copy', function(e) {
    if (charCopy) {
        charCopy = false;
        e.clipboardData.setData("text/plain", chars);
        chars = null;
        e.preventDefault();
    }
});