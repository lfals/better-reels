

window.onload = async function () {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tabs[0].id, { type: "getVolume" }, function (response) {
        volume_rocker.setAttribute("value", response * 100)
    });
    

    volume_rocker = document.getElementById("br-volume-input")

    volume_rocker.addEventListener("change", () => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "setVolume", volume: volume_rocker.value });
    })

};


