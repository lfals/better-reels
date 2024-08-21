const saveOptions = () => {
	const volume = document.getElementById('volume').value  / 100;
	const muted = document.getElementById('muted').checked;
	const autoplay = document.getElementById('autoplay').checked;
	const autoscroll = document.getElementById('autoscroll').checked;

	chrome.storage.sync.set(
		{ volume, muted, autoscroll, autoplay },
		() => {
			// Update status to let user know options were saved.
			const status = document.getElementById('status');
			status.textContent = 'Options saved.';
			setTimeout(() => {
				status.textContent = '';
			}, 750);
		}
	);
};

const restoreOptions = () => {

	chrome.storage.sync.get().then(items => {
		document.getElementById('volume').value = items.volume * 100;
		document.getElementById('muted').checked = items.muted;
		document.getElementById('autoplay').checked = items.autoplay;
		document.getElementById('autoscroll').checked = items.autoscroll;
	})
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
