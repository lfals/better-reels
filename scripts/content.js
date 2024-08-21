let default_config;
let lastUrl;

chrome.storage.sync.get().then((items) => {
	const { autoplay, volume, muted, autoscroll } = items;
	default_config = {
		controls: true,
		autoplay: autoplay !== undefined ? autoplay : false,
		volume: volume !== undefined ? volume : 0.05,
		muted: muted !== undefined ? muted : true,
		autoscroll: autoscroll !== undefined ? autoscroll : false,
	};

	main();
});

chrome.storage.onChanged.addListener((items) => {
	for (const [item, value] of Object.entries(items)) {
		default_config[item] = value.newValue;
	}

	main();
});

function main() {
	checkView();

	setInterval(() => {
		const currentUrl = window.location.pathname.split("/")[1];
		if (currentUrl === lastUrl) return;
		lastUrl = currentUrl;
		checkView();
	}, 100);
}

function checkView() {
	if (lastUrl === "reels") {
		handleReels();
		return;
	}

	if (lastUrl === "p") {
		handlePost()
		return;
	}

	handleFeed();
}

function handlePost() {
	const mainContainer = document.querySelector("body");

	const observer = new MutationObserver(() => {
		const el = document.querySelector("video");
		if (!el) return;
		el.controls = default_config.controls;
		el.autoplay = default_config.autoplay;
		el.volume = default_config.volume;
		el.onplaying = () => {
			el.muted = default_config.muted;
			el.volume = default_config.volume;
		};
		if (el.nextSibling) {
			el.nextSibling.remove();
		}
	});

	observer.observe(mainContainer, {
		childList: true,
	});
}

function handleFeed() {
	addControls(document);

	document.onscroll = () => {
		addControls(document);
	};
}

function handleReels() {
	const container = document.querySelector("section > main > div");

	const video = document.querySelector("section > main > div video");

	if (video === null) {
		setTimeout(() => {
			handleReels();
		}, 500);
		return;
	}
	addControls(document, { reels: true, container: container });

	container.onscroll = () => {
		addControls(document, { reels: true, container: container });
	};
}

function addControls(element, reels = { reels: false }) {
	const elementsOnCenter = element.elementsFromPoint(
		window.innerWidth / 2,
		window.innerHeight / 2,
	);
	elementsOnCenter.forEach((el) => {
		if (el.tagName !== "VIDEO") return;
		el.controls = default_config.controls;
		el.autoplay = default_config.autoplay;
		el.volume = default_config.volume;
		el.onplaying = () => {
			el.muted = default_config.muted;
		};
		if (el.nextSibling) {
			el.nextSibling.remove();
		}

		if (reels.reels === true && default_config.autoscroll === true) {
			el.onended = () => {
				reels.container.scrollBy({
					top: 400,
					behavior: "smooth",
				});
			};
		}
	});
}
