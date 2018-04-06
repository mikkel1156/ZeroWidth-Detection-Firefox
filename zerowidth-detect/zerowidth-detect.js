function handleResponse(response) {
    if (response.data) {
        document.documentElement.innerHTML = response.data;
    }
}

function handleError(error) {
    console.log(`Error: ${error}`);
}

function main() {
    var walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    var allNodes = [];
    var replace = "🕵";
    var characters = "";
    var zwRE = RegExp("(‍|‌|​|⁠)", "g");

    while(node = walker.nextNode()) {
        if (zwRE.test(node.nodeValue)) {
            for (var char in node.nodeValue.match(zwRE)) {
                characters += char;
            }
            allNodes.push(node);
            console.log("YAY!");
        }
    }

    browser.runtime.sendMessage({
        type: "update-info",
        data: characters,
        url: window.location.href
    }).then(null, handleError);

    function replaceNodes() {
        for (var i = 0; i < allNodes.length; i++) {
            allNodes[i].nodeValue = allNodes[i].nodeValue.replace(zwRE, replace);
            console.log(allNodes[i].nodeValue);
        }
    }

    browser.storage.local.get("whitelist").then(function(result) {
        if (!result.whitelist) {
            console.log("No whitelist found.");
            browser.storage.local.get("replace").then(function(result) {
                if (result.replace != null) {
                    console.log("Custom replace");
                    replace = result.replace;
                }
                replaceNodes();
            }, handleError);
        }

        var split = result.whitelist.split("|");
        for (var index in split) {
            if (split[index]) {
                var domain = split[index];
                domain = domain.replace(/\*/i, "([\w\.]+)");
                var domainRE = new RegExp("^https?:\/\/(www\.)?"+domain+"(\/.*)?", "i")
                var url = window.location.href;
                if (domainRE.test(url)) {
                    return;
                }
            }
        }

        browser.storage.local.get("replace").then(function(result) {
            if (result.replace) {
                console.log("Custom replace");
                replace = result.replace;
            }
            replaceNodes();
        }, handleError);
    }, handleError);
}

main();