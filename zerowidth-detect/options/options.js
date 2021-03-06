//  Outputting errors.
function gotError(error) {
    console.log(`[Zero-Width Detect] ${error}`);
}

//  Resetting all the settings.
document.querySelector("#reset").addEventListener("click", function() {
    //  Set all the settings to empty.
    browser.storage.local.set({
        whitelist: null,
        replace: null,
        check_clipboard: false,
        check_on_active: false
    });

    //  Update settings on the page.
    restoreOptions();
});

//  Add a new domain to the whitelist.
document.querySelector("#add-domain").addEventListener("click", function() {
    //  Query for the current whitelist settings.
    browser.storage.local.get("whitelist").then(function(result) {
        //  If nothing is NULL, just set it to nothing.
        if (result.whitelist == null)
            result.whitelist = "";

        //  Update the whitelist with the old whitelsit plus the new domain to add.
        browser.storage.local.set({
            whitelist: result.whitelist + document.querySelector("#new-domain").value + "|"
        });

        //  Update settings on the page.
        restoreOptions();
    }, gotError);
});

//  Save the custom replace string.
document.querySelector("#save").addEventListener("click", function() {
    //  Save the options as their current state.
    browser.storage.local.set({
        replace: document.querySelector("#new-replace").value,
        check_clipboard: document.querySelector("#check-clipboard").checked,
        check_on_active: document.querySelector("#check-on-active").checked
    });
});

//  Update the page with the settings already stored.
function restoreOptions() {
    //  Query for the whitelist settings.
    browser.storage.local.get("whitelist").then(function(result) {
        //  Set the whitelist table to contain 'DOMAIN' as header.
        document.querySelector("#whitelist").innerHTML = "<tr><th>DOMAIN</th></tr>";

        //  If there is no whitelist, return here.
        if (result.whitelist == null)
            return;

        //  Split the list up at the pipe anditerate over it.
        var split = result.whitelist.split("|");
        for (var index in split) {
            //  If it's not nothing, then add the current domain iteration it to the table.
            if (split[index] != "") {
                document.querySelector("#whitelist").innerHTML += "<tr><td>" + split[index] + "<div class='remove-domain' data-domain-index='"+ index.toString() +"'>❌</div></td></tr>";
            }
        }

        //  Iterarte over all the remove-domain buttons.
        var elements = document.getElementsByClassName("remove-domain");
        for (var i = 0; i < elements.length; i++) {
            //  Add a click listener to the button.
            elements[i].addEventListener("click", function() {
                //  Variables.
                var index = this.getAttribute("data-domain-index");
                var split = result.whitelist.split("|");
                var whitelist = "";

                //  Iterate over the whitelist.
                for (var index2 in split) {
                    //  Add all from the old whitelist to the new one, except the one to be removed.
                    if (split[index2] != "" && index != index2) {
                        whitelist += split[index2] + "|";
                    }
                }

                //  Update the whitelist with the updated one.
                browser.storage.local.get("whitelist").then(function(result) {
                    browser.storage.local.set({
                        whitelist: whitelist
                    });

                    //  Update settings on the page.
                    restoreOptions();
                }, gotError);
            });
        }
    }, gotError);

    //  Query for the custom replace string.
    browser.storage.local.get("replace").then(function(result) {
        //  If none is set, then update the page with the default one.
        if (result.replace == null) {
            document.querySelector("#new-replace").value = "🕵";
        } else {
            document.querySelector("#new-replace").value = result.replace;
        }
    }, gotError);

    //  Query for check clipboard.
    browser.storage.local.get("check_clipboard").then(function(result) {
        //  If a value found, then set checked status to that value.
        if (result.check_clipboard != null) {
            document.querySelector("#check-clipboard").checked = result.check_clipboard;
        }
    }, gotError);

    //  Query for check on active.
    browser.storage.local.get("check_on_active").then(function(result) {
        //  If a value found, then set checked status to that value.
        if (result.check_on_active != null) {
            document.querySelector("#check-on-active").checked = result.check_on_active;
        }
    }, gotError);
}

//  Update the options when the DOM is loaded.
document.addEventListener("DOMContentLoaded", restoreOptions);