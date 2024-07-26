document.addEventListener("scroll", buscarVideos)
document.addEventListener("load", buscarVideos)
buscarVideos()

function buscarVideos() {
	console.debug("buscarVídeos")
	const isReels = window.location.pathname.includes("reels")

	console.log(isReels)
	if (isReels) {
		formatReels()
		return
	}
	const videos = document.querySelectorAll("video");


	if (videos) {
		videos.forEach(video => {

			video.volume = 0.05
			video.muted = false
			video.controls = true

			if (video.nextSibling) {
				video.nextSibling.remove()
			}

		})

	}
}

function formatReels() {


	// document.querySelector("section > main > div").onscroll = () => console.log("teste")
	const container = document.querySelector("section > main > div")
	container.onscroll = () => {
		const element = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
		element.forEach(el => {
			if (el.tagName === "VIDEO") {
				el.nextSibling.remove()
				el.controls = true
				el.muted
				el.volume = 0.05
				el.muted = false
				el.onplaying = () => {
					el.muted = false
				}
				el.onended = () => {
					container.scrollBy({
						top: 400,
						behavior: "smooth"
					})
				};
			}
		})
	}

	// addControls()
	//
	// const observer = new MutationObserver(() => {
	// 	addControls()
	// 	console.log("callback that runs when observer is triggered");
	// });
	//
	// observer.observe(container, {
	// 	subtree: true,
	// 	childList: true,


}

//
// function addControls() {
// 	console.log("addControls")
// 	const videos = document.querySelectorAll("video")
//
// 	document.querySelectorAll("video ~ div").forEach(el => {
// 		el.remove()
// 	})
//
// 	// document.querySelectorAll("video ~ div > div > div > div > div > div").forEach(el => {
// 	// 	el.remove()
// 	// })
// 	//
// 	// document.querySelectorAll("video ~ div > div > div > div > div > div ~ div").forEach(el => {
// 	// 	console.log(el)
// 	// })
// 	//
//
//
// 	videos.forEach(video => {
//
// 		console.log(video.getBoundingClientRect())
//
// 		video.controls = true
// 		video.volume = 0.05
// 		video.muted = false
// 	})
//
// }
