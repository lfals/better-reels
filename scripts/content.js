// Constants
const DEFAULT_VOLUME = 0.05;
const URL_CHECK_INTERVAL = 100;
const REELS_PATH = "reels";
const CONTAINER_INDEX = 14;
const VIDEO_CONTAINER_INDEX = 13;
const DEFAULT_CONTROLS_INDEX = 4;
const DEBUG = false; // Toggle debugging on/off

// State variables
let ticking = false;
let lastVideoElement = null;
let currentUrl = "";
let currentUrlSplit = "";
let currentVolume = DEFAULT_VOLUME; // Store the current volume setting

/**
 * Debug utility function to log function entry, parameters, and return values
 * @param {string} functionName - Name of the function being debugged
 * @param {Object} params - Parameters passed to the function
 * @param {Function} fn - The function to execute
 * @returns {*} The result of the function execution
 */
function debugFunction(functionName, params, fn) {
	if (!DEBUG) return fn();

	console.group(`🔍 ${functionName} called`);
	console.log('Parameters:', params);

	try {
		const result = fn();
		console.log('Return value:', result);
		console.groupEnd();
		return result;
	} catch (error) {
		console.error('Error in function:', error);
		console.groupEnd();
		throw error;
	}
}

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
	return debugFunction('findVideoElementAtCenter', {}, () => {
		const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);
		const videoElement = elementsOnCenter.find((element) => {
			return element.tagName === "VIDEO";
		}) || null;

		return videoElement;
	});
}

/**
 * Updates the volume slider in the config page
 * @param {number} volume - The volume value to set (0-1)
 */
function updateVolumeSlider(volume) {
	return debugFunction('updateVolumeSlider', { volume }, () => {
		// Convert volume to percentage (0-100)
		const volumePercentage = Math.round(volume * 100);
		
		// Send message to update the volume slider in config.html
		chrome.runtime.sendMessage({
			type: "updateVolumeSlider",
			volume: volumePercentage
		});
	});
}

/**
 * Configures a video element with default settings and handles related UI elements
 * @param {HTMLVideoElement} videoElement - The video element to configure
 * @param {HTMLElement} container - The container element that holds the video and related UI
 * @param {HTMLElement} videoContainer - The video container element
 */
function configureVideoElement(videoElement, container, videoContainer) {
	return debugFunction('configureVideoElement', {
		videoElement: videoElement ? 'exists' : 'null',
		container: container ? 'exists' : 'null',
		videoContainer: videoContainer ? 'exists' : 'null'
	}, () => {
		if (!videoElement) return;

		// Reset previous video element styling if needed
		if (lastVideoElement && lastVideoElement !== videoElement) {
			lastVideoElement.style.border = "none";
		}

		// Configure the video element
		lastVideoElement = videoElement;
		videoElement.volume = currentVolume; // Use the current volume setting
		videoElement.muted = false; // Always unmute the video
		videoElement.setAttribute("controls", "true");

		// Add volume change event listener
		videoElement.addEventListener("volumechange", () => {
			// Update the current volume setting
			currentVolume = videoElement.volume;
			
			// Update the volume slider in config.html
			updateVolumeSlider(currentVolume);
			
			if (DEBUG) console.log(`Video volume changed to: ${currentVolume}`);
		});

		// Add ended event listener to ensure video stays unmuted when it loops
		videoElement.addEventListener("ended", () => {
			// Ensure video stays unmuted when it loops
			videoElement.muted = false;
			if (DEBUG) console.log("Video ended, ensuring it stays unmuted when it loops");
		});

		videoElement.addEventListener("playing", () => {
			// Ensure video stays unmuted when it loops
			videoElement.muted = false;
			if (DEBUG) console.log("Video playing, ensuring it stays unmuted when it loops");
		});

		// If container is provided, handle related UI elements
		if (container) {
			// Get profile info and actions
			const profileInfo = videoElement.nextSibling?.childNodes[0]?.children[0]?.children[0]?.children[0]?.children[1]?.children[0];
			const actions = container.children[1];

			if (profileInfo && actions) {
				// Style elements
				styleProfileInfo(profileInfo);
				styleActionsContainer(actions);
				styleVideoContainer(videoContainer);
				styleContentContainer(container);
				

				// Create and append actions container
				const actionsContainer = createActionsContainer(profileInfo, actions);
				container.appendChild(actionsContainer);

			}

			if (videoElement.nextSibling) {
				videoElement.nextSibling.remove();
			}
		}
	});
}

/**
 * Styles the profile information element
 * @param {HTMLElement} profileInfo - The profile information element
 */
function styleProfileInfo(profileInfo) {
	return debugFunction('styleProfileInfo', {
		profileInfo: profileInfo ? 'exists' : 'null'
	}, () => {
		if (!profileInfo) return;

		profileInfo.style.color = "black";
		profileInfo.style.width = "100%";
		profileInfo.style.margin = "0px";

		// Style all child elements
		Array.from(profileInfo.getElementsByTagName("*")).forEach(element => {
			element.style.color = "black";
		});
	});
}

/**
 * Styles the actions container
 * @param {HTMLElement} actions - The actions container element
 */
function styleActionsContainer(actions) {
	return debugFunction('styleActionsContainer', {
		actions: actions ? 'exists' : 'null'
	}, () => {
		if (!actions) return;

		actions.style.flexDirection = "row";
		actions.style.width = "100%";
		actions.style.justifyContent = "start";
		actions.style.gap = "10px";
		actions.style.alignItems = "center";
		actions.style.margin = "0px";
	});
}

/**
 * Styles the content container
 * @param {HTMLElement} contentContainer - The content container element
 */
function styleContentContainer(contentContainer) {
	return debugFunction('styleContentContainer', {
		contentContainer: contentContainer ? 'exists' : 'null'
	}, () => {
		if (!contentContainer) return;

		contentContainer.style.flexDirection = "row";
	});
}

/**
 * Creates and styles the actions container
 * @param {HTMLElement} profileInfo - The profile information element
 * @param {HTMLElement} actions - The actions container element
 * @returns {HTMLElement} The styled actions container
 */
function createActionsContainer(profileInfo, actions) {
	return debugFunction('createActionsContainer', {
		profileInfo: profileInfo ? 'exists' : 'null',
		actions: actions ? 'exists' : 'null'
	}, () => {
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
	});
}

/**
 * Handles the scroll end event for reels
 * @param {Event} event - The scroll event
 */
function handleReelsScrollEnd(event) {
	return debugFunction('handleReelsScrollEnd', {
		event: event ? 'exists' : 'null',
		ticking
	}, () => {
		if (ticking) return;

		window.requestAnimationFrame(() => {
			// Find elements at center
			const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);

			const videoContainer = elementsOnCenter[CONTAINER_INDEX];

			// Get container and video elements
			const container = elementsOnCenter[CONTAINER_INDEX];
			const videoElement = findVideoElementAtCenter();

			if (!videoElement || !container) {
				ticking = false;
				return;
			}

			// Configure video element and handle UI
			configureVideoElement(videoElement, container, videoContainer);

			ticking = false;
		});

		ticking = true;
	});
}

/**
 * get viewport height
 * @returns {number} The viewport height
 */
function getViewportHeight() {
	return debugFunction('getViewportHeight', {}, () => {
		return window.innerHeight;
	});
}

/**
 * Styles the reels scroll container
 * @param {HTMLElement} videoContainer - The reels scroll container element
 */
function styleVideoContainer(videoContainer) {
	return debugFunction('styleVideoContainer', {
		videoContainer: videoContainer ? 'exists' : 'null'
	}, () => {
		if (!videoContainer) return;

		// const height = getViewportHeight() - 32 - 158;

		// videoContainer.style.height = `${height}px`;
		// videoContainer.setAttribute("style", `height: ${height}px;`);
	});
}

/**
 * Main function that initializes the reels functionality
 */
function main() {
	return debugFunction('main', {
		currentUrlSplit
	}, () => {
		if (currentUrlSplit !== REELS_PATH) return;

		// Configure initial video element
		const videoElement = findVideoElementAtCenter();
		const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);
		const container = elementsOnCenter[CONTAINER_INDEX];
		const videoContainer = elementsOnCenter[VIDEO_CONTAINER_INDEX];


		if (videoElement) {
			configureVideoElement(videoElement, container, videoContainer);
			
		}

		// Set up scroll event listener
		const reelsScroll = document.querySelector("section > main > div");
		if (reelsScroll) {
			reelsScroll.addEventListener("scrollend", handleReelsScrollEnd);
		}
	});
}

// Set up message listener for volume control
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (DEBUG) {
		console.group('📨 Message received');
		console.log('Request:', request);
		console.log('Sender:', sender);
		console.groupEnd();
	}

	if (request.type === "setVolume") {
		// Update the current volume setting
		currentVolume = request.volume / 100;
		
		// Apply to the current video if it exists
		if (lastVideoElement) {
			lastVideoElement.volume = currentVolume;
			lastVideoElement.muted = false; // Ensure it's unmuted
			if (DEBUG) console.log(`Volume set to: ${currentVolume}`);
		}
	} else if (request.type === "getVolume") {
		const volume = lastVideoElement ? lastVideoElement.volume : currentVolume;
		if (DEBUG) console.log(`Volume returned: ${volume}`);
		sendResponse(volume);
	}
});