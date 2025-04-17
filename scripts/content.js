// Constants
const DEFAULT_VOLUME = 0.05;
const URL_CHECK_INTERVAL = 100;
const REELS_PATH = "reels";
const CONTAINER_INDEX = 14;
const VIDEO_CONTAINER_INDEX = 13;
const DEFAULT_CONTROLS_INDEX = 4;

// State variables
let ticking = false;
let lastVideoElement = null;
let currentUrl = "";
let currentUrlSplit = "";
let currentVolume = DEFAULT_VOLUME;

/**
 * Checks if the URL has changed and updates the state accordingly
 */
function checkUrl() {
	const newUrl = window.location.href;
	if (newUrl !== currentUrl) {
		currentUrl = newUrl;
		currentUrlSplit = currentUrl.split("/")[3];
		main();
	}
}

// Set up URL change detection
setInterval(checkUrl, URL_CHECK_INTERVAL);

/**
 * Finds the video element at the center of the screen
 * @returns {HTMLVideoElement|null} The video element or null if not found
 */
function findVideoElementAtCenter() {
	const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);
	const videoElement = elementsOnCenter.find((element) => {
		return element.tagName === "VIDEO";
	}) || null;

	return videoElement;
}

/**
 * Updates the volume slider in the config page
 * @param {number} volume - The volume value to set (0-1)
 */
function updateVolumeSlider(volume) {
	const volumePercentage = Math.round(volume * 100);
	
	chrome.runtime.sendMessage({
		type: "updateVolumeSlider",
		volume: volumePercentage
	});
}

/**
 * Configures a video element with default settings and handles related UI elements
 * @param {HTMLVideoElement} videoElement - The video element to configure
 * @param {HTMLElement} container - The container element that holds the video and related UI
 * @param {HTMLElement} videoContainer - The video container element
 */
function configureVideoElement(videoElement, container, videoContainer) {
	if (!videoElement) return;

	if (lastVideoElement && lastVideoElement !== videoElement) {
		lastVideoElement.style.border = "none";
	}

	lastVideoElement = videoElement;
	videoElement.volume = currentVolume;
	videoElement.muted = false;
	videoElement.setAttribute("controls", "true");

	videoElement.addEventListener("volumechange", () => {
		currentVolume = videoElement.volume || DEFAULT_VOLUME;
		
		updateVolumeSlider(currentVolume);
	});

	videoElement.addEventListener("ended", () => {
		videoElement.muted = false;
	});

	videoElement.addEventListener("playing", () => {
		videoElement.muted = false;
	});

	if (container) {
		const profileInfo = videoElement.nextSibling?.childNodes[0]?.children[0]?.children[0]?.children[0]?.children[1]?.children[0];
		const actions = container.children[1];

		if (profileInfo && actions) {
			styleProfileInfo(profileInfo);
			styleActionsContainer(actions);
			styleVideoContainer(videoContainer);
			styleContentContainer(container);
			
			const actionsContainer = createActionsContainer(profileInfo, actions);
			container.appendChild(actionsContainer);
		}

		if (videoElement.nextSibling) {
			videoElement.nextSibling.remove();
		}
	}
}

/**
 * Styles the profile information element
 * @param {HTMLElement} profileInfo - The profile information element
 */
function styleProfileInfo(profileInfo) {
	if (!profileInfo) return;

	profileInfo.style.color = "black";
	profileInfo.style.width = "100%";
	profileInfo.style.margin = "0px";

	Array.from(profileInfo.getElementsByTagName("*")).forEach(element => {
		element.style.color = "black";
	});
}

/**
 * Styles the actions container
 * @param {HTMLElement} actions - The actions container element
 */
function styleActionsContainer(actions) {
	if (!actions) return;

	actions.style.flexDirection = "row";
	actions.style.width = "100%";
	actions.style.justifyContent = "start";
	actions.style.gap = "10px";
	actions.style.alignItems = "start";
	actions.style.margin = "0px";
}

/**
 * Styles the content container
 * @param {HTMLElement} contentContainer - The content container element
 */
function styleContentContainer(contentContainer) {
	if (!contentContainer) return;

	contentContainer.style.flexDirection = "row";
}

/**
 * Creates and styles the actions container
 * @param {HTMLElement} profileInfo - The profile information element
 * @param {HTMLElement} actions - The actions container element
 * @returns {HTMLElement} The styled actions container
 */
function createActionsContainer(profileInfo, actions) {
	const actionsContainer = document.createElement("div");

	actionsContainer.style.display = "flex";
	actionsContainer.style.flexDirection = "column";
	actionsContainer.style.alignItems = "end";
	actionsContainer.style.justifyContent = "end";
	actionsContainer.style.width = "369.562px";
	actionsContainer.style.marginLeft = "16px";
	actionsContainer.style.gap = "16px";

	actionsContainer.appendChild(profileInfo);
	actionsContainer.appendChild(actions);

	return actionsContainer;
}

/**
 * Handles the scroll end event for reels
 * @param {Event} event - The scroll event
 */
function handleReelsScrollEnd(event) {
	if (ticking) return;

	window.requestAnimationFrame(() => {
		const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);

		const videoContainer = elementsOnCenter[CONTAINER_INDEX];

		const container = elementsOnCenter[CONTAINER_INDEX];
		const videoElement = findVideoElementAtCenter();

		if (!videoElement || !container) {
			ticking = false;
			return;
		}

		configureVideoElement(videoElement, container, videoContainer);

		ticking = false;
	});

	ticking = true;
}

/**
 * get viewport height
 * @returns {number} The viewport height
 */
function getViewportHeight() {
	return window.innerHeight;
}

/**
 * Styles the reels scroll container
 * @param {HTMLElement} videoContainer - The reels scroll container element
 */
function styleVideoContainer(videoContainer) {
	if (!videoContainer) return;

	videoContainer.style.marginLeft = "310px";
}

/**
 * Main function that initializes the reels functionality
 */
function main() {
	if (currentUrlSplit !== REELS_PATH) return;

	const videoElement = findVideoElementAtCenter();
	const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);
	const container = elementsOnCenter[CONTAINER_INDEX];
	const videoContainer = elementsOnCenter[VIDEO_CONTAINER_INDEX];

	if (videoElement) {
		configureVideoElement(videoElement, container, videoContainer);
	}

	const reelsScroll = document.querySelector("section > main > div");
	if (reelsScroll) {
		reelsScroll.addEventListener("scrollend", handleReelsScrollEnd);
	}
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === "setVolume") {
		currentVolume = request.volume / 100;
		
		if (lastVideoElement) {
			lastVideoElement.volume = currentVolume;
			lastVideoElement.muted = false;
		}
	} else if (request.type === "getVolume") {
		const volume = lastVideoElement ? lastVideoElement.volume : currentVolume;
		sendResponse(volume);
	}
});