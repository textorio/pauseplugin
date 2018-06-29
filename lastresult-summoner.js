window.lastResult = undefined;
requestId = 0;

(async function () {
    var LRRequest = (function () {

        function getData() {
            var id = requestId++;

            return new Promise(function (resolve, reject) {
                var listener = function (evt) {
                    if (evt.detail.requestId == id) {
                        window.removeEventListener("lastresult_data", listener);
                        resolve(evt.detail.data);
                    }
                };

                window.addEventListener("lastresult_data", listener);

                var payload = {id: id};

                window.dispatchEvent(new CustomEvent("lastresult", {detail: payload}));
            });
        }

        return {getData: getData};
    })();

    LRRequest.getData().then(function (data) {
        window.lastResult = data;
    });

    return await LRRequest.getData();
})();
