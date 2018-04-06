function gotError(error) {
    console.log(`Error: ${error}`);
}

document.querySelector("#reset").addEventListener("click", function() {
    browser.storage.local.set({
        whitelist: "",
        replace: ""
    });
});

document.querySelector("#add-domain").addEventListener("click", function() {
    browser.storage.local.get("whitelist").then(function(result) {
        if (result.whitelist == null)
            result.whitelist = "";
        browser.storage.local.set({
            whitelist: result.whitelist + document.querySelector("#new-domain").value + "|"
        });
        restoreOptions();
    }, gotError);
});

document.querySelector("#save-replace").addEventListener("click", function() {
    browser.storage.local.set({
        replace: document.querySelector("#new-replace").value
    });
});

function restoreOptions() {
    browser.storage.local.get("whitelist").then(function(result) {
        document.querySelector("#whitelist").innerHTML = "<tr><th>DOMAIN</th></tr>";
        if (result.whitelist == null)
            return;

        var split = result.whitelist.split("|");
        for (var index in split) {
            //console.log(split[index]);
            if (split[index] != "") {
                document.querySelector("#whitelist").innerHTML += "<tr><td>" + split[index] + "<div class='remove-domain' data-domain-index='"+ index.toString() +"'>❌</div></td></tr>";
            }
        }

        var elements = document.getElementsByClassName("remove-domain");
        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener("click", function() {
                var index = this.getAttribute("data-domain-index");
                var split = result.whitelist.split("|");
                var whitelist = "";

                for (var index2 in split) {
                    if (split[index2] != "" && index != index2) {
                        whitelist += split[index2] + "|";
                    }
                }
                browser.storage.local.get("whitelist").then(function(result) {
                    browser.storage.local.set({
                        whitelist: whitelist
                    });
                    restoreOptions();
                }, gotError);
            });
        }
    }, gotError);

    browser.storage.local.get("replace").then(function(result) {
        document.querySelector("#new-replace").value = result.replace || "🕵"
    }, gotError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);