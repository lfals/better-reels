window.onload = async function () {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    volume_rocker = document.getElementById("br-volume-input");

    // Get initial volume from the active tab
    chrome.tabs.sendMessage(tabs[0].id, { type: "getVolume" }, function (response) {
        volume_rocker.setAttribute("value", response * 100);
    });
    
    // Listen for volume changes from the slider
    volume_rocker.addEventListener("change", () => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "setVolume", volume: volume_rocker.value });
    });

    // Listen for volume updates from the content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "updateVolumeSlider") {
            volume_rocker.setAttribute("value", request.volume);
        }
    });
};


