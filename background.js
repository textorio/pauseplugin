function video(doc) {
    console.log("Main function");

    //https://stackoverflow.com/questions/31116220/control-youtube-player-from-a-chrome-extension

    let video = $(doc).find(".html5-main-video").first();
    console.log(video);
    console.log(doc);

    debugger;
    video.pause();
    //$(video).preload="none";
    //$('video').currentTime = 100;
    video.addEventListener("loadstart", function () {
        video.pause();
    }, false);
}

function main() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                type: 'main'
            },
            function (response) {
            });
    });
}


function log(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                type: 'log',
                data: message
            },
            function (response) {
            });
    });
}

function error(message) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                type: 'error',
                data: message
            },
            function (response) {
            });
    });
}


function define(name, value) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {
                type: 'define',
                data: {
                    name: name,
                    value: value
                }
            },
            function (response) {
            });
    });
}



chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message && message.type == 'main') {
        log("Entering Chrome kernel");
        injectScripts(["jquery-3.3.1.js", "work.js"]);
        var doc = message.document;
        main();
        sendResponse(true);
    }
});

//https://stackoverflow.com/questions/21317476/how-to-use-jquery-in-chrome-extension
// Top level await is bad for you!
// https://stackoverflow.com/questions/39679505/using-await-outside-of-an-async-function
function injectScripts(scripts, callback) {
    if(scripts.length) {
        var script = scripts.shift();
        chrome.tabs.executeScript({file: script}, function() {
            if(chrome.runtime.lastError && typeof callback === "function") {
                callback(false); // Injection failed
            }
            injectScripts(scripts, callback);
        });
    } else {
        if(typeof callback === "function") {
            callback(true);
        }
    }
}
