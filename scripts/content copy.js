
let default_config = {
	controls: true,
	autoplay: false,
	volume: 0.05,
	muted: true,
	autoScroll: false,
}

setInterval(() => {
	const currentUrl = window.location.pathname.split("/")[1]
	if (currentUrl === lastUrl) return

	lastUrl = currentUrl
	checkView()

}, 100)


let lastUrl

checkView()

function checkView() {
	console.log("checkView")

	if (lastUrl === "reels") {
		handleReels()
		return
	}

	if (lastUrl === "p") {
		handlePost()
		return
	}

	handleFeed()
}

async function addControls(element, reels = { reels: false }) {


	const elementsOnCenter = element.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
	elementsOnCenter.forEach(el => {

		if (el.tagName !== "VIDEO") return
		el.controls = default_config.controls
		el.autoplay = default_config.autoplay
		el.download = true
		el.volume = default_config.volume
		el.onplaying = () => {
			el.muted = default_config.muted
		}
		if (el.nextSibling) {
			el.nextSibling.remove()
		}

		if (reels.reels === true && default_config.autoScroll === true) {
			el.onended = () => {
				reels.container.scrollBy({
					top: 400,
					behavior: "smooth"
				})
			};

		}

	})


}

function handlePost() {

	const mainContainer = document.querySelector("body")


	const observer = new MutationObserver(() => {
		const el = document.querySelector("video")
		if (!el) return
		el.controls = default_config.controls
		el.autoplay = default_config.autoplay
		el.volume = default_config.volume
		el.onplaying = () => {
			el.muted = default_config.muted
			el.volume = default_config.volume
		}
		if (el.nextSibling) {
			el.nextSibling.remove()
		}


	})

	observer.observe(mainContainer, {
		childList: true
	})
}

function handleFeed() {

	addControls(document)

	document.onscroll = () => {
		addControls(document)
	}

}

function handleReels() {

	const container = document.querySelector("section > main > div")

	const video = document.querySelector("section > main > div video")


	if (video === null) {
		setTimeout(() => {
			handleReels()
		}, 500)
		return
	}

	addControls(document, { reels: true, container: container })

	container.onscroll = () => {
		addControls(document, { reels: true, container: container })
	}

}


