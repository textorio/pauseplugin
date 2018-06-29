var that = this;

var lastresult = undefined;

var downloadYouTubeScreenshot = function(wnd, name, useBlob) {
    return downloadVideoScreenshot(wnd, getYouTubeVideo(wnd), name, useBlob);
};

var getYouTubeVideo = function(wnd) {
    var video = wnd.document.getElementsByClassName("html5-main-video")[0];
    video.videoHeight;
    video.videoWidth;
    return video;
};

var downloadVideoScreenshot = function(wnd, video, name, useBlob) {
    var canvas = wnd.document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    var dataURI = canvas.toDataURL('image/jpeg');

    return downloadDataURI(wnd, dataURI, name, useBlob);
};

var dataURIToBlob = function(wnd, dataURI, mimetype) {
    var BASE64_MARKER = ';base64,';
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = wnd.atob(base64);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    var blob = new Blob([uInt8Array.buffer]);
    return blob;
};

var dataURIToArray = function(wnd, dataURI, mimetype) {
    var BASE64_MARKER = ';base64,';
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    return base64;
};


function downloadDataURI (wnd, dataURI, name, useBlob) {
    if (useBlob) {
        return dataURIToArray(wnd, dataURI, 'jpg');
    }

    var blob = dataURIToBlob(wnd, dataURI, 'jpg');
    var url = wnd.webkitURL || wnd.URL || wnd.mozURL || wnd.msURL;
    var a = wnd.document.createElement('a');
    a.id = "xxx";
    a.download = name;
    a.href = url.createObjectURL(blob);
    a.textContent = 'Click here to download!';
    a.dataset.downloadurl = ['jpg', a.download, a.href].join(':');
    a.click();

    return blob;
}

var makeScreenshot = function(time) {
    console.log("impl-script: making screenshot");

    var video = document.getElementsByTagName("video")[0];

    var screenshotOK = false;
    video.addEventListener("playing", function() {
        screenshotOK = true;
        video.pause();
        lastresult = downloadYouTubeScreenshot(window, "youtube-screenshot.jpg", true);
        console.log("screenshot recorded");
    }, true);

    video.currentTime = time;
    video.play();

    console.log("impl-script: making screenshot finished");
};

var setVideoQuality = function(quality) {
    var node = document.querySelector('[title="Настройки"]');

    function eventFire(el, etype){
        if (el.fireEvent) {
            el.fireEvent('on' + etype);
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }

    eventFire(node, 'click');

    var divRef;
    var spans = document.getElementsByTagName("div");
    var spanContainer;
    for(var i = 0; i < spans.length; i++){
        if(spans[i].innerHtml == "Настройки"){
            spanContainer = spans[i].parentNode;
            break;
        }
    }
    console.log(spanContainer);



    var divRef;
    var spans = document.getElementsByTagName("span");
    var spanContainer;
    for(var i = 0; i < spans.length; i++){
        if(spans[i].innerText === "Автонастройка"){
            spanContainer = spans[i].parentNode;
            break;
        }
    }
    console.log(spanContainer);
    eventFire(spanContainer, 'click');

    var spanHQ;
    function go () {
        var divRef;
        var spans = document.getElementsByTagName("span");

        for(var i = 0; i < spans.length; i++){
            if(spans[i].innerHTML.includes(quality)){
                spanHQ = spans[i];
                break;
            }
        }

        if (undefined !== spanHQ) {
            console.log(spanHQ);
            eventFire(spanHQ.parentElement.parentElement, 'click');
        } else {
            console.log("still waiting our span");
            setTimeout(go, 500);
        }
    }
    go();


};


window.main = function () {
    console.log("main");
    var video = document.getElementsByTagName("video")[0];
    video.pause();
    video.addEventListener("canplay", function() {
        video.pause();
    }, true);
    setVideoQuality("1080p");
};

function eventFire(el, etype){
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}

window.addEventListener('lastresult', function(evt) {
    //console.log(lastresult);
    var request = evt.detail;
    var response = {requestId: request.id, data: lastresult};
    window.dispatchEvent(new CustomEvent("lastresult_data", {detail: response}));
});

window.addEventListener('make_screenshot', function(evt) {
    console.log("content-script: make screenshot event catched");
    var request = evt.detail;

    makeScreenshot(request.time);

    var response = {requestId: request.id, data: true};
    window.dispatchEvent(new CustomEvent("make_screenshot_data", {detail: response}));
    console.log("content-script: make screenshot event replied");
});

window.addEventListener("message", function (event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    switch (event.data.type) {
        case "main":
            this.main();
            break;
        case "log":
            console.log(event.data.value);
            break;
        case "error":
            console.error(event.data.value);
            break;
        case "define":
            this[event.data.name] = event.data.value;
            console.log("Defined " + event.data.name + " = " + event.data.value);
            break;
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    if (message && message.type == 'main') {
        window.postMessage({type: "main"}, "*"/*required!*/);
    }
    else if (message && message.type == 'log') {
        //window.postMessage({ type: "log", value: message.data }, "*"/*required!*/);
        console.log(message.data);
    } else if (message && message.type == 'error') {
        //window.postMessage({ type: "error",  value: message.data }, "*"/*required!*/);
        console.error(message.data);
    } else if (message && message.type == 'define') {
        window.postMessage({type: "define", name: message.data.name, value: message.data.value}, "*"/*required!*/);
    }
});

chrome.runtime.sendMessage({
    type: 'main',
    document: window.document
}, function (response) {
    console.log('switched context to Chrome kernel (' + response + ')');
});
