function handleResponse(response) {
    document.documentElement.innerHTML = response.data;
}

function handleError(error) {
    console.log(`Error: ${error}`);
}

browser.storage.local.get("whitelist").then(function(result) {
    if (result.whitelist == null) {
        console.log("wat??");
        return browser.runtime.sendMessage({
            type: "html",
            data: document.documentElement.innerHTML,
            url: window.location.href
        }).then(handleResponse, handleError);
    }

    var split = result.whitelist.split("|");
    console.log(split);
    for (var index in split) {
        if (split[index]) {
            console.log(split[index]);
            var domain = split[index];
            domain = domain.replace(/\*/i, "([\w\.]+)");
            console.log("|"+domain+"|");
            var pattern = new RegExp("^https?:\/\/(www\.)?"+domain+"(\/.*)?", "i")
            var url = window.location.href;
            console.log("cri");
            if (pattern.test(url)) {
                console.log("TRUE");
                browser.runtime.sendMessage({
                    type: "html",
                    data: document.documentElement.innerHTML,
                    url: window.location.href
                }).then(handleResponse, handleError);
            } else {
                console.log("FALSE");
            }
        }
    }
}, handleError);
console.log("wat");
