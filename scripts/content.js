// Constants
const DEFAULT_VOLUME = 0.05;
const URL_CHECK_INTERVAL = 100;
const REELS_PATH = "reels";
const CONTAINER_INDEX = 14;

// State variables
let ticking = false;
let lastVideoElement = null;
let currentUrl = "";
let currentUrlSplit = "";

/**
 * Checks if the URL has changed and updates the state accordingly
 */
function checkUrl() {
	const newUrl = window.location.href
	if (newUrl !== currentUrl) {
		currentUrl = newUrl
		currentUrlSplit = currentUrl.split("/")[3]
		console.log({ currentUrlSplit })
		main()
	}
}

// Set up URL change detection
setInterval(checkUrl, URL_CHECK_INTERVAL)

/**
 * Finds the video element at the center of the screen
 * @returns {HTMLVideoElement|null} The video element or null if not found
 */
function findVideoElementAtCenter() {
	const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
	return elementsOnCenter.find((element) => {
		return element.tagName === "VIDEO"
	}) || null;
}

/**
 * Configures a video element with default settings and handles related UI elements
 * @param {HTMLVideoElement} videoElement - The video element to configure
 * @param {HTMLElement} container - The container element that holds the video and related UI
 */
function configureVideoElement(videoElement, container) {
	if (!videoElement) return;
	
	// Reset previous video element styling if needed
	if (lastVideoElement && lastVideoElement !== videoElement) {
		lastVideoElement.style.border = "none";
	}
	
	// Configure the video element
	lastVideoElement = videoElement;
	videoElement.volume = DEFAULT_VOLUME;
	videoElement.muted = false;
	videoElement.setAttribute("controls", "true");
	
	// If container is provided, handle related UI elements
	if (container) {
		// Get profile info and actions
		const profileInfo = videoElement.nextSibling?.childNodes[0]?.children[0]?.children[0]?.children[0]?.children[1]?.children[0];
		const actions = container.children[1];
		
		if (profileInfo && actions) {
			// Style elements
			styleProfileInfo(profileInfo);
			styleActionsContainer(actions);
			
			// Create and append actions container
			const actionsContainer = createActionsContainer(profileInfo, actions);
			container.appendChild(actionsContainer);
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

	// Style all child elements
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
	actions.style.alignItems = "center";
	actions.style.margin = "0px";
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
	actionsContainer.style.alignItems = "center";
	actionsContainer.style.justifyContent = "center";
	actionsContainer.style.width = "369.562px";
	
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
		// Find elements at center
		const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);
		
		// Get container and video elements
		const container = elementsOnCenter[CONTAINER_INDEX];
		const videoElement = findVideoElementAtCenter();
		
		if (!videoElement || !container) {
			ticking = false;
			return;
		}
		
		// Configure video element and handle UI
		configureVideoElement(videoElement, container);
		
		ticking = false;
	});
	
	ticking = true;
}

/**
 * Main function that initializes the reels functionality
 */
function main() {
	if (currentUrlSplit !== REELS_PATH) return;
	
	// Configure initial video element
	const videoElement = findVideoElementAtCenter();
	const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);
	const container = elementsOnCenter[CONTAINER_INDEX];
	
	if (videoElement) {
		configureVideoElement(videoElement, container);
	}
	
	// Set up scroll event listener
	const reelsScroll = document.querySelector("section > main > div");
	if (reelsScroll) {
		reelsScroll.addEventListener("scrollend", handleReelsScrollEnd);
	}
}

// Set up message listener for volume control
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === "setVolume") {
		if (lastVideoElement) {
			lastVideoElement.volume = request.volume / 100;
		}
	} else if (request.type === "getVolume") {
		sendResponse(lastVideoElement ? lastVideoElement.volume : DEFAULT_VOLUME);
	}
});