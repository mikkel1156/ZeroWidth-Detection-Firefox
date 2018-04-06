function handleResponse(response) {
    console.log("RESPONSE: \n" + response.DATA);
    document.documentElement.innerHTML = response.data;
    console.log("NEW DATA: \n" + response.data);
}

function handleError(error) {
    console.log(`Error: ${error}`);
}

browser.storage.local.get("whitelist").then(function(result) {
    if (result.whitelist == null || result.whitelist == "") {
        console.log("No whitelist found.");
        return browser.runtime.sendMessage({
            type: "html",
            data: document.documentElement.innerHTML,
            url: window.location.href
        }).then(handleResponse, handleError);
    }

    var split = result.whitelist.split("|");
    for (var index in split) {
        if (split[index]) {
            var domain = split[index];
            domain = domain.replace(/\*/i, "([\w\.]+)");
            var pattern = new RegExp("^https?:\/\/(www\.)?"+domain+"(\/.*)?", "i")
            var url = window.location.href;
            console.log("cri");
            if (!pattern.test(url)) {
                browser.runtime.sendMessage({
                    type: "html",
                    data: document.documentElement.innerHTML,
                    url: window.location.href
                }).then(handleResponse, handleError);
            }
        }
    }
}, handleError);