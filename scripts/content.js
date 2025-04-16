let ticking = false;
let lastVideoElement
let currentUrl
let currentUrlSplit

function checkUrl() {
	const newUrl = window.location.href
	if (newUrl !== currentUrl) {
		currentUrl = newUrl
		currentUrlSplit = currentUrl.split("/")[3]
		console.log({ currentUrlSplit })
		main()
	}
}

setInterval(() => {
	checkUrl()
}, 100)


function main() {

	if (currentUrlSplit === "reels") {

		const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
		const videoElement = elementsOnCenter.find((element) => {
			return element.tagName === "VIDEO"
		})

		if (videoElement) {
			lastVideoElement = videoElement
			videoElement.volume = 0.05
			videoElement.muted = false

		}

		const reelsScroll = document.querySelector("section > main > div")
		reelsScroll.addEventListener("scrollend", (e) => {

			if (!ticking) {
				window.requestAnimationFrame(() => {
					if (lastVideoElement) {
						lastVideoElement.style.border = "none"
					}

					const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)

					const videoElement = elementsOnCenter.find((element) => {
						return element.tagName === "VIDEO"
					})

					if (videoElement) {
						lastVideoElement = videoElement
						videoElement.volume = 0.05
						videoElement.muted = false
						const muteButton = videoElement.nextElementSibling.children[0].children[0].children[0].children[0].children[0].children[0]

					}


					ticking = false;
				});

				ticking = true;
			}

		})
	}

	if (currentUrlSplit === "") {
		const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
		const videoElement = elementsOnCenter.find((element) => {
			return element.tagName === "VIDEO"
		})

		if (videoElement) {
			lastVideoElement = videoElement
			videoElement.volume = 0.05
			videoElement.muted = false

		}

		const reelsScroll = document.querySelector("#mount_0_0_UT")
		reelsScroll.addEventListener("scroll", (e) => {
			console.log("scroll")
			if (!ticking) {
				window.requestAnimationFrame(() => {
					if (lastVideoElement) {
						lastVideoElement.style.border = "none"
					}

					const elementsOnCenter = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)

					const videoElement = elementsOnCenter.find((element) => {
						return element.tagName === "VIDEO"
					})

					console.log({ videoElement })
					if (videoElement) {
						lastVideoElement = videoElement
						videoElement.volume = 0.05
						videoElement.muted = false
						const muteButton = videoElement.nextElementSibling.children[0].children[0].children[0].children[0].children[0].children[0]

					}


					ticking = false;
				});

				ticking = true;
			}
		})
	}
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === "setVolume") {
		if (lastVideoElement) {
			lastVideoElement.volume = request.volume / 100
		}
	} else if (request.type === "getVolume") {
		sendResponse(lastVideoElement ? lastVideoElement.volume : 0.05)
	}
}
)