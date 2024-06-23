var events_dispatched = 0;
var event_dispatch_delay_ms = 500;

// This must remain here as a separate function - this makes it work
// more like a sync func (in this context) even though it's async
function Get (key) {
    return new Promise((resolve) => {
        chrome.storage.local.get(
            [key],
            (result) => {
                resolve(result[key]);
            }
        );
    });
}

// This must remain here as a separate function - this makes it work
// more like a sync func (in this context) even though it's async
function Set (data) {
    new Promise((resolve) => {
        chrome.storage.local.set(
            data,
            () => {
                resolve();
            }
        );
    }).then(() => {
        // pass
    });
}

function dispatch_event () {
    if (events_dispatched >= (5000 / event_dispatch_delay_ms)) {
        return;
    }

    window.dispatchEvent(new CustomEvent("DashGlobalStorageReady"));

    events_dispatched += 1;

    // Repeatedly dispatch this for five seconds as extra failsafe to make sure the event isn't missed
    setTimeout(dispatch_event, event_dispatch_delay_ms);
}

window.addEventListener("message", async (event) => {
    if (event.source !== window || !event.data?.["type"]) {
        return;
    }

    if (event.data["type"] === "DashGlobalStorageSet") {
        var data = {};

        data[event.data["key"]] = event.data["value"];

        await Set(data);
    }

    else if (event.data["type"] === "DashGlobalStorageGet") {
        window.postMessage(
            {
                "type": "DashGlobalStorageGetResponse",
                "callback_id": event.data["callback_id"],
                "value": await Get(event.data["key"])
            },
            "*"
        );
    }
});

// This receives messages from this extension's background context (background.js)
chrome.runtime.onMessage.addListener((message, sender, send_response_cb) => {
    if (message["type"] === "DashGlobalStorageGet") {
        (async () => {  // This has to be isolated so that the return statement won't get held up
            send_response_cb({
                "type": "DashGlobalStorageGetResponse",
                "callback_id": message["callback_id"],
                "value": await Get(message["key"])
            });
        })();

        return true;  // Required so the message handler stays open to wait for the async response
    }
});

dispatch_event();
