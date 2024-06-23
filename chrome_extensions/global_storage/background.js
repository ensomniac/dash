// This sends messages to this extension's content context (content.js)
function send_message_to_content (callback, async=true) {
    var found = false;

    for (var query of [
        {
            "active": true,
            "currentWindow": true
        },
        {
            "highlighted": true,
            "currentWindow": true
        },
        {
            "highlighted": true
        },
        {
            "active": true  // This is last deliberately
        }
    ]) {
        if (found) {
            break;
        }

        chrome.tabs.query(
            query,
            (tabs) => {
                if (tabs.length !== 1) {
                    return;
                }

                found = true;

                callback(tabs[0].id);

                if (async) {
                    return true;  // Required so the message handler stays open to wait for the async response
                }
            }
        );
    }
}

// This receives messages from any other extensions that specify this extension's ID
chrome.runtime.onMessageExternal.addListener((message, sender, send_response_cb) => {
    if (message["type"] === "DashGlobalStorageGet") {
        send_message_to_content((tab_id) => {
            chrome.tabs.sendMessage(
                tab_id,
                {
                    "type": "DashGlobalStorageGet",
                    "callback_id": message["callback_id"],
                    "key": message["key"]
                },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.log(
                            "(GS background DashGlobalStorageGet) responseCallback failed:",
                            chrome.runtime.lastError.message
                        );

                        return;
                    }

                    send_response_cb(response);
                }
            );
        });

        return true;  // Required so the message handler stays open to wait for the async response
    }
});
